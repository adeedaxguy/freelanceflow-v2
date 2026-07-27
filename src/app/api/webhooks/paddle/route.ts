export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getPaddleConfig,
  getPlanForPaddlePrice,
  verifyPaddleSignature,
} from "@/lib/paddle";

interface PaddleSubscriptionPayload {
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string | null;
    transaction_id?: string | null;
    next_billed_at?: string | null;
    current_billing_period?: { ends_at?: string | null } | null;
    scheduled_change?: { action?: string; effective_at?: string | null } | null;
    custom_data?: { user_id?: string } | null;
    items?: Array<{ price?: { id?: string } }>;
  };
}

function dateValue(value: unknown) {
  if (typeof value !== "string" || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasPaddleAccess(status: string) {
  return new Set(["active", "trialing", "paused", "past_due"]).has(status.toLowerCase());
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const config = getPaddleConfig();
  if (!config.webhookSecret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const signature = req.headers.get("paddle-signature") || "";
  if (!verifyPaddleSignature(rawBody, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: PaddleSubscriptionPayload;
  try {
    payload = JSON.parse(rawBody) as PaddleSubscriptionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventType = payload.event_type || "";
  if (!eventType.startsWith("subscription.")) {
    return NextResponse.json({ received: true, ignored: eventType || "unsupported_event" });
  }

  const data = payload.data;
  const externalSubscriptionId = data?.id;
  const status = data?.status;
  const priceId = data?.items?.[0]?.price?.id;
  if (!externalSubscriptionId || !status || !priceId) {
    return NextResponse.json({ error: "Incomplete subscription payload." }, { status: 400 });
  }

  const existing = await prisma.billingSubscription.findUnique({
    where: { externalSubscriptionId },
  });
  const userId = data.custom_data?.user_id || existing?.userId;
  const plan = getPlanForPaddlePrice(config, priceId) || existing?.plan;
  if (!userId || !plan) {
    console.warn("Ignored Paddle subscription with no mapped user or price", {
      externalSubscriptionId,
      priceId,
      eventType,
    });
    return NextResponse.json({ received: true, ignored: "unmapped_subscription" }, { status: 202 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) {
    return NextResponse.json({ received: true, ignored: "unknown_user" }, { status: 202 });
  }

  const testMode = config.environment === "sandbox";
  if (testMode && user.role !== "ADMIN") {
    return NextResponse.json({ received: true, ignored: "sandbox_non_admin" }, { status: 202 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.billingSubscription.upsert({
      where: { externalSubscriptionId },
      create: {
        userId,
        provider: "PADDLE",
        externalSubscriptionId,
        externalCustomerId: data.customer_id || null,
        externalOrderId: data.transaction_id || null,
        plan,
        variantId: priceId,
        status,
        testMode,
        renewsAt: dateValue(data.next_billed_at),
        endsAt: dateValue(
          data.scheduled_change?.action === "cancel"
            ? data.scheduled_change.effective_at
            : data.current_billing_period?.ends_at,
        ),
      },
      update: {
        provider: "PADDLE",
        externalCustomerId: data.customer_id || null,
        externalOrderId: data.transaction_id || null,
        plan,
        variantId: priceId,
        status,
        testMode,
        renewsAt: dateValue(data.next_billed_at),
        endsAt: dateValue(
          data.scheduled_change?.action === "cancel"
            ? data.scheduled_change.effective_at
            : data.current_billing_period?.ends_at,
        ),
      },
    });

    if (testMode) return;

    const subscriptions = await tx.billingSubscription.findMany({
      where: { userId, testMode: false },
      select: { plan: true, status: true, provider: true },
    });
    const plans = subscriptions
      .filter((subscription) => (
        subscription.provider === "PADDLE"
          ? hasPaddleAccess(subscription.status)
          : new Set(["active", "on_trial", "paused", "past_due", "unpaid"]).has(
            subscription.status.toLowerCase(),
          )
      ))
      .map((subscription) => subscription.plan);
    const effectivePlan = plans.includes("agency") ? "agency" : plans.includes("pro") ? "pro" : "free";
    await tx.user.update({ where: { id: userId }, data: { plan: effectivePlan } });
  });

  return NextResponse.json({ received: true, event: eventType });
}
