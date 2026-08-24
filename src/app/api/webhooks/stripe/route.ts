export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { callingPackagePlan, getCallingPackage, packageIdFromCallingPlan } from "@/lib/calling-packages";
import { prisma } from "@/lib/prisma";
import { getStripeConfig, verifyStripeSignature } from "@/lib/stripe";
import { provisionPhoneNumber } from "@/lib/telephony";

type Metadata = Record<string, string | undefined>;

interface StripeEvent {
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

function stripeStatus(subscription: Record<string, unknown>, fallback = "unknown") {
  return typeof subscription.status === "string" ? subscription.status : fallback;
}

function planFromMetadata(metadata: Metadata) {
  const packageId = metadata.package_id || packageIdFromCallingPlan(metadata.plan);
  const pkg = packageId ? getCallingPackage(packageId) : null;
  return pkg ? callingPackagePlan(pkg.id) : null;
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

      const userId = metadata.userId || metadata.user_id;
      const plan = metadata.plan;
      if (userId && plan && session.payment_status === "paid" && !packageIdFromCallingPlan(plan)) {
        await prisma.user.update({ where: { id: userId }, data: { plan } });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const metadata = metadataOf(subscription);
      if (metadata.purchase_type === "softphone_number") return handleNumberSubscription(subscription, event);
      if (metadata.purchase_type === "softphone_minutes") return handleMinutesSubscription(subscription, event);

      const subscriptionId = stringValue(subscription.id);
      if (subscriptionId) {
        const [phonePurchase, minutesSubscription] = await Promise.all([
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
        ]);
        if (phonePurchase) return handleNumberSubscription(subscription, event);
        if (minutesSubscription) return handleMinutesSubscription(subscription, event);
      }

      const userId = metadata.userId || metadata.user_id;
      if (event.type === "customer.subscription.deleted") {
        if (userId) await prisma.user.update({ where: { id: userId }, data: { plan: "free" } });
      } else {
        const priceId = priceIdOf(subscription);
        if (userId && priceId) {
          const plan = await getPlanFromPriceId(priceId);
          if (plan) await prisma.user.update({ where: { id: userId }, data: { plan } });
        }
      }
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
