export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getLemonSqueezyConfig,
  getPlanForVariant,
  hasSubscriptionAccess,
  verifyLemonSqueezySignature,
} from "@/lib/lemonsqueezy";
import { provisionPhoneNumber } from "@/lib/telephony";

interface SubscriptionPayload {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
      purchase_type?: string;
      telephony_purchase_id?: string;
    };
  };
  data?: {
    type?: string;
    id?: string;
    attributes?: Record<string, unknown>;
  };
}

function stringValue(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function dateValue(value: unknown) {
  if (typeof value !== "string" || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function handleSoftphoneSubscription(input: {
  payload: SubscriptionPayload;
  externalSubscriptionId: string;
  variantId: string;
  status: string;
  attributes: Record<string, unknown>;
  eventName: string;
  configuredVariantId: string;
}) {
  const {
    payload,
    externalSubscriptionId,
    variantId,
    status,
    attributes,
    eventName,
    configuredVariantId,
  } = input;
  const requestedPurchaseId = payload.meta?.custom_data?.telephony_purchase_id;
  const purchase = requestedPurchaseId
    ? await prisma.telephonyPurchase.findUnique({ where: { id: requestedPurchaseId } })
    : await prisma.telephonyPurchase.findUnique({ where: { externalSubscriptionId } });

  if (!purchase || variantId !== configuredVariantId || purchase.variantId !== variantId) {
    console.warn("Ignored an unmapped softphone subscription", {
      externalSubscriptionId,
      requestedPurchaseId,
      variantId,
      eventName,
    });
    return NextResponse.json({ received: true, ignored: "unmapped_softphone_subscription" }, { status: 202 });
  }

  const user = await prisma.user.findUnique({
    where: { id: purchase.userId },
    select: { role: true },
  });
  if (!user) {
    return NextResponse.json({ received: true, ignored: "unknown_user" }, { status: 202 });
  }

  const testMode = attributes.test_mode === true;
  if (testMode && user.role !== "ADMIN") {
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  const canProvision = ["active", "on_trial"].includes(status.toLowerCase());
  const terminal = ["expired", "refunded"].includes(status.toLowerCase());
  const nextStatus = testMode
    ? "PAID_TEST"
    : purchase.status === "ACTIVE" && !terminal
      ? "ACTIVE"
      : canProvision
        ? "PAYMENT_CONFIRMED"
        : terminal
          ? "EXPIRED"
          : purchase.status;

  await prisma.telephonyPurchase.update({
    where: { id: purchase.id },
    data: {
      externalSubscriptionId,
      externalCustomerId: stringValue(attributes.customer_id),
      externalOrderId: stringValue(attributes.order_id),
      subscriptionStatus: status,
      testMode,
      renewsAt: dateValue(attributes.renews_at),
      endsAt: dateValue(attributes.ends_at),
      status: nextStatus,
      lastError: null,
    },
  });

  if (canProvision && !testMode && purchase.status !== "ACTIVE") {
    await provisionPhoneNumber(purchase.id);
  }

  return NextResponse.json({
    received: true,
    event: eventName,
    softphone: testMode ? "test_payment_verified" : canProvision ? "provisioned" : "updated",
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const config = await getLemonSqueezyConfig();

  if (!config.webhookSecret) {
    console.error("Lemon Squeezy webhook rejected: signing secret is not configured.");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const signature = req.headers.get("x-signature") || "";
  if (!verifyLemonSqueezySignature(rawBody, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: SubscriptionPayload;
  try {
    payload = JSON.parse(rawBody) as SubscriptionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName = req.headers.get("x-event-name") || payload.meta?.event_name || "";
  if (!eventName.startsWith("subscription_") || payload.data?.type !== "subscriptions") {
    return NextResponse.json({ received: true, ignored: eventName || "unsupported_event" });
  }

  const externalSubscriptionId = payload.data.id;
  const attributes = payload.data.attributes || {};
  const status = stringValue(attributes.status);
  const variantId = stringValue(attributes.variant_id);

  if (!externalSubscriptionId || !status || !variantId) {
    return NextResponse.json({ error: "Incomplete subscription payload." }, { status: 400 });
  }

  const isSoftphoneSubscription = (
    payload.meta?.custom_data?.purchase_type === "softphone_number"
    || (
      config.softphoneVariantId !== ""
      && variantId === config.softphoneVariantId
    )
  );
  if (isSoftphoneSubscription) {
    try {
      return await handleSoftphoneSubscription({
        payload,
        externalSubscriptionId,
        variantId,
        status,
        attributes,
        eventName,
        configuredVariantId: config.softphoneVariantId,
      });
    } catch (error) {
      console.error("Softphone subscription provisioning failed", {
        externalSubscriptionId,
        eventName,
        error,
      });
      return NextResponse.json({ error: "Phone provisioning failed." }, { status: 500 });
    }
  }

  const existing = await prisma.billingSubscription.findUnique({
    where: { externalSubscriptionId },
  });
  const userId = payload.meta?.custom_data?.user_id || existing?.userId;
  const plan = getPlanForVariant(config, variantId) || existing?.plan;

  if (!userId || !plan) {
    console.warn("Ignored Lemon Squeezy subscription with no mapped user or variant", {
      externalSubscriptionId,
      variantId,
      eventName,
    });
    return NextResponse.json({ received: true, ignored: "unmapped_subscription" }, { status: 202 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ received: true, ignored: "unknown_user" }, { status: 202 });
  }

  const testMode = attributes.test_mode === true;
  if (testMode && user.role !== "ADMIN") {
    console.warn("Ignored a test-mode subscription for a non-admin account", { userId, eventName });
    return NextResponse.json({ received: true, ignored: "test_mode_non_admin" }, { status: 202 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.billingSubscription.upsert({
      where: { externalSubscriptionId },
      create: {
        userId,
        externalSubscriptionId,
        externalCustomerId: stringValue(attributes.customer_id),
        externalOrderId: stringValue(attributes.order_id),
        plan,
        variantId,
        status,
        testMode,
        renewsAt: dateValue(attributes.renews_at),
        endsAt: dateValue(attributes.ends_at),
        trialEndsAt: dateValue(attributes.trial_ends_at),
        cardBrand: stringValue(attributes.card_brand),
        cardLastFour: stringValue(attributes.card_last_four),
      },
      update: {
        externalCustomerId: stringValue(attributes.customer_id),
        externalOrderId: stringValue(attributes.order_id),
        plan,
        variantId,
        status,
        testMode,
        renewsAt: dateValue(attributes.renews_at),
        endsAt: dateValue(attributes.ends_at),
        trialEndsAt: dateValue(attributes.trial_ends_at),
        cardBrand: stringValue(attributes.card_brand),
        cardLastFour: stringValue(attributes.card_last_four),
      },
    });

    // Test subscriptions prove the integration without changing production access.
    if (testMode) return;

    const subscriptions = await tx.billingSubscription.findMany({
      where: { userId, testMode: false },
      select: { plan: true, status: true },
    });
    const entitledPlans = subscriptions
      .filter((subscription) => hasSubscriptionAccess(subscription.status))
      .map((subscription) => subscription.plan);
    const effectivePlan = entitledPlans.includes("agency")
      ? "agency"
      : entitledPlans.includes("pro")
        ? "pro"
        : "free";

    await tx.user.update({ where: { id: userId }, data: { plan: effectivePlan } });
  });

  return NextResponse.json({ received: true, event: eventName });
}
