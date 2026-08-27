export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { callingPackagePlan, getCallingPackage, packageIdFromCallingPlan } from "@/lib/calling-packages";
import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { getStripeConfig, verifyStripeSignature } from "@/lib/stripe";
import { provisionPhoneNumber } from "@/lib/telephony";

type Metadata = Record<string, string | undefined>;

interface StripeEvent {
  id?: string;
  type: string;
  livemode?: boolean;
  data: { object: Record<string, unknown> };
}

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

function metadataOf(value: Record<string, unknown>) {
  return (value.metadata && typeof value.metadata === "object" ? value.metadata : {}) as Metadata;
}

function dateValue(value: unknown) {
  const seconds = typeof value === "number" ? value : Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : null;
}

function priceIdOf(subscription: Record<string, unknown>) {
  const items = subscription.items as { data?: Array<{ price?: { id?: string } }> } | undefined;
  return items?.data?.[0]?.price?.id || null;
}

function failureMessage(value: Record<string, unknown>) {
  const error = value.last_payment_error as Record<string, unknown> | undefined;
  return stringValue(error?.message)
    || stringValue(value.failure_message)
    || stringValue(value.status)
    || "Payment did not complete";
}

function subscriptionIdFromInvoice(invoice: Record<string, unknown>) {
  const parent = invoice.parent as { subscription_details?: { subscription?: unknown } } | undefined;
  return stringValue(invoice.subscription) || stringValue(parent?.subscription_details?.subscription);
}

function stripeStatus(subscription: Record<string, unknown>, fallback = "unknown") {
  return typeof subscription.status === "string" ? subscription.status : fallback;
}

function planFromMetadata(metadata: Metadata) {
  const packageId = metadata.package_id || packageIdFromCallingPlan(metadata.plan);
  const pkg = packageId ? getCallingPackage(packageId) : null;
  return pkg ? callingPackagePlan(pkg.id) : null;
}

function paidPlan(value: string | null | undefined) {
  return value === "pro" || value === "agency" ? value : null;
}

function subscriptionDates(subscription: Record<string, unknown>) {
  const status = stripeStatus(subscription);
  return {
    renewsAt: status === "canceled" ? null : dateValue(subscription.current_period_end),
    endsAt: dateValue(subscription.ended_at)
      || dateValue(subscription.canceled_at)
      || dateValue(subscription.cancel_at)
      || (status === "canceled" ? dateValue(subscription.current_period_end) : null),
    trialEndsAt: dateValue(subscription.trial_end),
  };
}

function hasLivePhoneAccess(status: string, endsAt: Date | null) {
  const normalized = status.toLowerCase();
  if (["active", "trialing", "past_due"].includes(normalized)) return true;
  return normalized === "canceled" && Boolean(endsAt && endsAt.getTime() > Date.now());
}

function hasPlanAccess(status: string, endsAt: Date | null) {
  const normalized = status.toLowerCase();
  if (["active", "trialing", "past_due"].includes(normalized)) return true;
  return normalized === "canceled" && Boolean(endsAt && endsAt.getTime() > Date.now());
}

async function updateEffectivePlan(userId: string) {
  const [subscriptions, user] = await Promise.all([
    prisma.billingSubscription.findMany({
      where: { userId, testMode: false, plan: { in: ["pro", "agency"] } },
      select: { plan: true, status: true, endsAt: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
  ]);
  const activePlans = subscriptions
    .filter(subscription => hasPlanAccess(subscription.status, subscription.endsAt))
    .map(subscription => subscription.plan);
  const nextPlan = activePlans.includes("agency")
    ? "agency"
    : activePlans.includes("pro")
      ? "pro"
      : "free";
  const activatingPaidPlan = user?.plan === "free" && nextPlan !== "free";
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: nextPlan,
      ...(activatingPaidPlan ? { weeklyLeads: 0, weeklyLeadReset: new Date() } : {}),
    },
  });
}

async function rejectNonAdminTest(userId: string, testMode: boolean) {
  if (!testMode) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role !== "ADMIN";
}

async function handleNumberCheckout(session: Record<string, unknown>, event: StripeEvent) {
  const metadata = metadataOf(session);
  const purchaseId = metadata.telephony_purchase_id;
  const subscriptionId = stringValue(session.subscription);
  if (!purchaseId || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: "incomplete_softphone_number_checkout" }, { status: 202 });
  }

  const purchase = await prisma.telephonyPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) return NextResponse.json({ received: true, ignored: "unknown_softphone_purchase" }, { status: 202 });

  const testMode = !(session.livemode ?? event.livemode ?? false);
  if (await rejectNonAdminTest(purchase.userId, testMode)) {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  const paid = ["paid", "no_payment_required"].includes(String(session.payment_status || ""));
  await prisma.telephonyPurchase.update({
    where: { id: purchase.id },
    data: {
      externalSubscriptionId: subscriptionId,
      externalCustomerId: stringValue(session.customer),
      externalOrderId: stringValue(session.id),
      subscriptionStatus: paid ? "active" : stringValue(session.payment_status),
      testMode,
      status: testMode ? "PAID_TEST" : paid ? "PAYMENT_CONFIRMED" : purchase.status,
      lastError: null,
    },
  });

  if (paid && !testMode && purchase.status !== "ACTIVE") {
    await provisionPhoneNumber(purchase.id);
  }

  return NextResponse.json({ received: true, softphone: testMode ? "test_payment_verified" : "number_checkout_completed" });
}

async function handleNumberSubscription(subscription: Record<string, unknown>, event: StripeEvent) {
  const metadata = metadataOf(subscription);
  const subscriptionId = stringValue(subscription.id);
  if (!subscriptionId) return NextResponse.json({ received: true, ignored: "missing_subscription_id" }, { status: 202 });

  const purchase = metadata.telephony_purchase_id
    ? await prisma.telephonyPurchase.findUnique({ where: { id: metadata.telephony_purchase_id } })
    : await prisma.telephonyPurchase.findUnique({ where: { externalSubscriptionId: subscriptionId } });
  if (!purchase) return NextResponse.json({ received: true, ignored: "unknown_softphone_subscription" }, { status: 202 });

  const status = stripeStatus(subscription, event.type === "customer.subscription.deleted" ? "canceled" : "unknown");
  const dates = subscriptionDates({ ...subscription, status });
  const testMode = !(subscription.livemode ?? event.livemode ?? false);
  if (await rejectNonAdminTest(purchase.userId, testMode)) {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  const canProvision = ["active", "trialing"].includes(status.toLowerCase());
  const hasAccess = hasLivePhoneAccess(status, dates.endsAt);
  const nextStatus = testMode
    ? "PAID_TEST"
    : purchase.status === "ACTIVE" && hasAccess
      ? "ACTIVE"
      : canProvision
        ? "PAYMENT_CONFIRMED"
        : ["canceled", "incomplete_expired", "unpaid"].includes(status.toLowerCase())
          ? "EXPIRED"
          : purchase.status;

  await prisma.telephonyPurchase.update({
    where: { id: purchase.id },
    data: {
      externalSubscriptionId: subscriptionId,
      externalCustomerId: stringValue(subscription.customer),
      subscriptionStatus: status,
      testMode,
      renewsAt: dates.renewsAt,
      endsAt: dates.endsAt,
      status: nextStatus,
      lastError: null,
    },
  });

  if (canProvision && !testMode && purchase.status !== "ACTIVE") {
    await provisionPhoneNumber(purchase.id);
  }

  return NextResponse.json({ received: true, softphone: "number_subscription_updated" });
}

async function handleMinutesCheckout(session: Record<string, unknown>, event: StripeEvent) {
  const metadata = metadataOf(session);
  const userId = metadata.user_id;
  const plan = planFromMetadata(metadata);
  const subscriptionId = stringValue(session.subscription);
  if (!userId || !plan || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: "incomplete_softphone_minutes_checkout" }, { status: 202 });
  }

  const testMode = !(session.livemode ?? event.livemode ?? false);
  if (await rejectNonAdminTest(userId, testMode)) {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  await prisma.billingSubscription.upsert({
    where: { externalSubscriptionId: subscriptionId },
    create: {
      userId,
      provider: "STRIPE",
      externalSubscriptionId: subscriptionId,
      externalCustomerId: stringValue(session.customer),
      externalOrderId: stringValue(session.id),
      plan,
      variantId: plan,
      status: ["paid", "no_payment_required"].includes(String(session.payment_status || "")) ? "active" : String(session.payment_status || "checkout_completed"),
      testMode,
    },
    update: {
      provider: "STRIPE",
      externalCustomerId: stringValue(session.customer),
      externalOrderId: stringValue(session.id),
      plan,
      variantId: plan,
      status: ["paid", "no_payment_required"].includes(String(session.payment_status || "")) ? "active" : String(session.payment_status || "checkout_completed"),
      testMode,
    },
  });

  return NextResponse.json({ received: true, softphone: "minutes_checkout_completed" });
}

async function handleMinutesSubscription(subscription: Record<string, unknown>, event: StripeEvent) {
  const metadata = metadataOf(subscription);
  const subscriptionId = stringValue(subscription.id);
  if (!subscriptionId) return NextResponse.json({ received: true, ignored: "missing_subscription_id" }, { status: 202 });

  const existing = await prisma.billingSubscription.findUnique({ where: { externalSubscriptionId: subscriptionId } });
  const userId = metadata.user_id || existing?.userId;
  const plan = planFromMetadata(metadata) || existing?.plan;
  if (!userId || !plan || !packageIdFromCallingPlan(plan)) {
    return NextResponse.json({ received: true, ignored: "unmapped_softphone_minutes_subscription" }, { status: 202 });
  }

  const testMode = !(subscription.livemode ?? event.livemode ?? false);
  if (await rejectNonAdminTest(userId, testMode)) {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  const status = stripeStatus(subscription, event.type === "customer.subscription.deleted" ? "canceled" : "unknown");
  const dates = subscriptionDates({ ...subscription, status });
  await prisma.billingSubscription.upsert({
    where: { externalSubscriptionId: subscriptionId },
    create: {
      userId,
      provider: "STRIPE",
      externalSubscriptionId: subscriptionId,
      externalCustomerId: stringValue(subscription.customer),
      plan,
      variantId: priceIdOf(subscription) || plan,
      status,
      testMode,
      renewsAt: dates.renewsAt,
      endsAt: dates.endsAt,
      trialEndsAt: dates.trialEndsAt,
    },
    update: {
      provider: "STRIPE",
      externalCustomerId: stringValue(subscription.customer),
      plan,
      variantId: priceIdOf(subscription) || plan,
      status,
      testMode,
      renewsAt: dates.renewsAt,
      endsAt: dates.endsAt,
      trialEndsAt: dates.trialEndsAt,
    },
  });

  return NextResponse.json({ received: true, softphone: "minutes_subscription_updated" });
}

async function handlePlanCheckout(session: Record<string, unknown>, event: StripeEvent) {
  const metadata = metadataOf(session);
  const userId = metadata.user_id || metadata.userId;
  const plan = paidPlan(metadata.plan);
  const subscriptionId = stringValue(session.subscription);
  if (!userId || !plan || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: "incomplete_plan_checkout" }, { status: 202 });
  }

  const testMode = !(session.livemode ?? event.livemode ?? false);
  if (await rejectNonAdminTest(userId, testMode)) {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  const status = ["paid", "no_payment_required"].includes(String(session.payment_status || ""))
    ? "active"
    : String(session.payment_status || "checkout_completed");
  await prisma.billingSubscription.upsert({
    where: { externalSubscriptionId: subscriptionId },
    create: {
      userId,
      provider: "STRIPE",
      externalSubscriptionId: subscriptionId,
      externalCustomerId: stringValue(session.customer),
      externalOrderId: stringValue(session.id),
      plan,
      variantId: plan,
      status,
      testMode,
    },
    update: {
      provider: "STRIPE",
      externalCustomerId: stringValue(session.customer),
      externalOrderId: stringValue(session.id),
      plan,
      variantId: plan,
      status,
      testMode,
    },
  });

  if (!testMode && hasPlanAccess(status, null)) await updateEffectivePlan(userId);
  return NextResponse.json({ received: true, plan: "checkout_completed" });
}

async function handlePlanSubscription(subscription: Record<string, unknown>, event: StripeEvent, fallbackPlan?: string | null) {
  const metadata = metadataOf(subscription);
  const subscriptionId = stringValue(subscription.id);
  if (!subscriptionId) return NextResponse.json({ received: true, ignored: "missing_subscription_id" }, { status: 202 });

  const existing = await prisma.billingSubscription.findUnique({ where: { externalSubscriptionId: subscriptionId } });
  const userId = metadata.user_id || metadata.userId || existing?.userId;
  const plan = paidPlan(metadata.plan) || paidPlan(existing?.plan) || paidPlan(fallbackPlan);
  if (!userId || !plan) {
    return NextResponse.json({ received: true, ignored: "unmapped_plan_subscription" }, { status: 202 });
  }

  const testMode = !(subscription.livemode ?? event.livemode ?? false);
  if (await rejectNonAdminTest(userId, testMode)) {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  const status = stripeStatus(subscription, event.type === "customer.subscription.deleted" ? "canceled" : "unknown");
  const dates = subscriptionDates({ ...subscription, status });
  await prisma.billingSubscription.upsert({
    where: { externalSubscriptionId: subscriptionId },
    create: {
      userId,
      provider: "STRIPE",
      externalSubscriptionId: subscriptionId,
      externalCustomerId: stringValue(subscription.customer),
      plan,
      variantId: priceIdOf(subscription) || plan,
      status,
      testMode,
      renewsAt: dates.renewsAt,
      endsAt: dates.endsAt,
      trialEndsAt: dates.trialEndsAt,
    },
    update: {
      provider: "STRIPE",
      externalCustomerId: stringValue(subscription.customer),
      plan,
      variantId: priceIdOf(subscription) || plan,
      status,
      testMode,
      renewsAt: dates.renewsAt,
      endsAt: dates.endsAt,
      trialEndsAt: dates.trialEndsAt,
    },
  });

  if (!testMode) await updateEffectivePlan(userId);
  return NextResponse.json({ received: true, plan: "subscription_updated" });
}

async function handleCheckoutIssue(session: Record<string, unknown>, event: StripeEvent, status: "failed" | "expired") {
  const metadata = metadataOf(session);
  const purchaseType = metadata.purchase_type || "unknown";
  const userId = metadata.user_id || metadata.userId;
  const sessionId = stringValue(session.id);
  const message = status === "expired" ? "Checkout session expired before payment was completed" : failureMessage(session);

  if (purchaseType === "softphone_number" && metadata.telephony_purchase_id) {
    await prisma.telephonyPurchase.updateMany({
      where: { id: metadata.telephony_purchase_id },
      data: {
        status: status === "expired" ? "CHECKOUT_EXPIRED" : "CHECKOUT_FAILED",
        lastError: message.slice(0, 500),
      },
    });
  }

  await recordAuditLog({
    action: status === "expired" ? "payment_checkout_expired" : "payment_failed",
    actorId: userId,
    actorEmail: stringValue(session.customer_email),
    targetType: "StripeCheckout",
    targetId: sessionId || event.id || null,
    details: {
      gateway: "stripe",
      eventType: event.type,
      purchaseType,
      userId,
      checkoutSessionId: sessionId,
      paymentStatus: stringValue(session.payment_status),
      customerId: stringValue(session.customer),
      subscriptionId: stringValue(session.subscription),
      message,
    },
  });

  return NextResponse.json({ received: true, stripe: status === "expired" ? "checkout_expired_logged" : "checkout_failed_logged" });
}

async function handleInvoicePaymentFailed(invoice: Record<string, unknown>, event: StripeEvent) {
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  const customerId = stringValue(invoice.customer);
  const testMode = !(invoice.livemode ?? event.livemode ?? false);
  const message = failureMessage(invoice);
  const amountDue = typeof invoice.amount_due === "number" ? invoice.amount_due : null;
  const attemptCount = typeof invoice.attempt_count === "number" ? invoice.attempt_count : null;
  const nextPaymentAttempt = dateValue(invoice.next_payment_attempt)?.toISOString() ?? null;

  const [phonePurchase, billingSubscription] = subscriptionId
    ? await Promise.all([
        prisma.telephonyPurchase.findUnique({ where: { externalSubscriptionId: subscriptionId } }),
        prisma.billingSubscription.findUnique({ where: { externalSubscriptionId: subscriptionId } }),
      ])
    : [null, null] as const;
  const userId = phonePurchase?.userId || billingSubscription?.userId || metadataOf(invoice).user_id || metadataOf(invoice).userId;

  if (phonePurchase) {
    await prisma.telephonyPurchase.update({
      where: { id: phonePurchase.id },
      data: {
        subscriptionStatus: "past_due",
        lastError: message.slice(0, 500),
        testMode,
      },
    });
  }
  if (billingSubscription) {
    await prisma.billingSubscription.update({
      where: { id: billingSubscription.id },
      data: { status: "past_due", testMode },
    });
  }

  await recordAuditLog({
    action: "payment_failed",
    actorId: userId,
    actorEmail: "stripe",
    targetType: phonePurchase ? "TelephonyPurchase" : billingSubscription ? "BillingSubscription" : "StripeInvoice",
    targetId: phonePurchase?.id || billingSubscription?.id || stringValue(invoice.id) || event.id || null,
    details: {
      gateway: "stripe",
      eventType: event.type,
      userId,
      invoiceId: stringValue(invoice.id),
      subscriptionId,
      customerId,
      amountDue,
      currency: stringValue(invoice.currency),
      attemptCount,
      nextPaymentAttempt,
      message,
    },
  });

  return NextResponse.json({ received: true, stripe: "invoice_payment_failed_logged" });
}

async function getPlanFromPriceId(priceId: string): Promise<string | null> {
  try {
    const [proSetting, agencySetting] = await Promise.all([
      prisma.platformSetting.findUnique({ where: { key: "pro_price_id" } }),
      prisma.platformSetting.findUnique({ where: { key: "agency_price_id" } }),
    ]);
    if (proSetting?.value === priceId) return "pro";
    if (agencySetting?.value === priceId) return "agency";
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const config = await getStripeConfig();

  if (!config.webhookSecret) {
    console.error("Stripe webhook rejected: signing secret is not configured.");
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }
  if (!verifyStripeSignature(body, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(body) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = metadataOf(session);
      if (metadata.purchase_type === "softphone_number") return handleNumberCheckout(session, event);
      if (metadata.purchase_type === "softphone_minutes") return handleMinutesCheckout(session, event);
      if (metadata.purchase_type === "plan") return handlePlanCheckout(session, event);

      const userId = metadata.userId || metadata.user_id;
      const plan = metadata.plan;
      if (userId && plan && session.payment_status === "paid" && !packageIdFromCallingPlan(plan)) {
        return handlePlanCheckout(session, event);
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      return handleCheckoutIssue(event.data.object, event, "failed");
    }

    if (event.type === "checkout.session.expired") {
      return handleCheckoutIssue(event.data.object, event, "expired");
    }

    if (event.type === "invoice.payment_failed") {
      return handleInvoicePaymentFailed(event.data.object, event);
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const metadata = metadataOf(subscription);
      if (metadata.purchase_type === "softphone_number") return handleNumberSubscription(subscription, event);
      if (metadata.purchase_type === "softphone_minutes") return handleMinutesSubscription(subscription, event);

      const subscriptionId = stringValue(subscription.id);
      if (subscriptionId) {
        const [phonePurchase, minutesSubscription, planSubscription] = await Promise.all([
          prisma.telephonyPurchase.findUnique({
            where: { externalSubscriptionId: subscriptionId },
            select: { id: true },
          }),
          prisma.billingSubscription.findFirst({
            where: {
              externalSubscriptionId: subscriptionId,
              provider: "STRIPE",
              plan: { startsWith: "softphone_minutes_" },
            },
            select: { id: true },
          }),
          prisma.billingSubscription.findFirst({
            where: {
              externalSubscriptionId: subscriptionId,
              provider: "STRIPE",
              plan: { in: ["pro", "agency"] },
            },
            select: { id: true },
          }),
        ]);
        if (phonePurchase) return handleNumberSubscription(subscription, event);
        if (minutesSubscription) return handleMinutesSubscription(subscription, event);
        if (planSubscription) return handlePlanSubscription(subscription, event);
      }

      const userId = metadata.userId || metadata.user_id;
      if (userId && paidPlan(metadata.plan)) {
        return handlePlanSubscription(subscription, event);
      }
      const priceId = priceIdOf(subscription);
      if (userId && priceId) {
        const plan = await getPlanFromPriceId(priceId);
        if (plan) return handlePlanSubscription(subscription, event, plan);
      }
    }
  } catch (error) {
    await recordAuditLog({
      action: "payment_webhook_error",
      actorEmail: "stripe",
      targetType: "StripeEvent",
      targetId: event.id || event.type,
      details: {
        gateway: "stripe",
        eventType: event.type,
        error: error instanceof Error ? error.message : "Handler failed",
      },
    });
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
