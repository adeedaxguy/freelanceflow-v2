export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createStripeSubscriptionCheckout,
  createStripeBillingPortalSession,
  getStripeConfig,
  isStripeCheckoutConfigured,
} from "@/lib/stripe";
import { recordAuditLog } from "@/lib/audit-log";
import { isPlanUpgrade } from "@/lib/plan-limits";
import type { PaidPlan } from "@/lib/plan-pricing";
import { getConfiguredPlanMonthlyPrice } from "@/lib/plan-pricing.server";
import { securityRateLimit, rateLimitHeaders } from "@/lib/security-rate-limit";

type BillingInterval = "monthly" | "annual";

const PLAN_LABELS: Record<PaidPlan, string> = {
  pro: "Pro",
  agency: "Agency",
};

async function monthlyPriceCents(plan: PaidPlan) {
  return Math.round((await getConfiguredPlanMonthlyPrice(plan)) * 100);
}

function stripePriceId(plan: PaidPlan, billing: BillingInterval) {
  return process.env[`STRIPE_${plan.toUpperCase()}_${billing.toUpperCase()}_PRICE_ID`]?.trim() || undefined;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    plan?: PaidPlan;
    billing?: BillingInterval;
  };
  const plan = body?.plan;
  const billing = body?.billing || "monthly";

  if (!plan || !["pro", "agency"].includes(plan) || !["monthly", "annual"].includes(billing)) {
    return NextResponse.json({ error: "Invalid plan or billing interval." }, { status: 400 });
  }

  try {
    const rate = await securityRateLimit("plan-checkout", session.user.id, 8, 10 * 60_000);
    if (!rate.allowed) return NextResponse.json({ error: "Please wait before starting another checkout." }, { status: 429, headers: rateLimitHeaders(rate) });
    const [config, user] = await Promise.all([
      getStripeConfig(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, role: true, plan: true },
      }),
    ]);

    if (!isStripeCheckoutConfigured(config)) {
      await recordAuditLog({ action: "payment_checkout_blocked", actorId: session.user.id, details: { plan, reason: "not_configured" } });
      return NextResponse.json({
        error: "Stripe checkout is still being configured.",
      }, { status: 503 });
    }

    if (config.testMode && user?.role !== "ADMIN") {
      await recordAuditLog({ action: "payment_checkout_blocked", actorId: session.user.id, details: { plan, reason: "private_test_mode" } });
      return NextResponse.json({
        error: "Paid plans are still in private checkout testing. Your free account remains active.",
      }, { status: 503 });
    }

    const adminTestCheckout = config.testMode && user?.role === "ADMIN";
    if (!adminTestCheckout && !isPlanUpgrade(user?.plan ?? "free", plan)) {
      return NextResponse.json({
        error: user?.plan === plan
          ? `Your ${PLAN_LABELS[plan]} plan is already active.`
          : "Choose Manage billing to change or cancel your current subscription.",
      }, { status: 409 });
    }

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL
      || process.env.NEXTAUTH_URL
      || req.nextUrl.origin
    ).replace(/\/$/, "");

    // Change an existing subscription in Stripe's confirmation flow, never sell a second one.
    const existing = await prisma.billingSubscription.findFirst({
      where: {
        userId: session.user.id,
        testMode: config.testMode,
        plan: { in: ["pro", "agency"] },
        status: { notIn: ["canceled", "cancelled", "expired", "incomplete_expired"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      if (existing.provider !== "STRIPE" || !existing.externalCustomerId) {
        return NextResponse.json({ error: "You already have a subscription. Use Manage billing to change it.", manageBilling: true }, { status: 409 });
      }
      const portal = await createStripeBillingPortalSession(config, {
        customerId: existing.externalCustomerId,
        subscriptionId: existing.status === "active" ? existing.externalSubscriptionId : undefined,
        priceId: stripePriceId(plan, billing),
        returnUrl: `${appUrl}/dashboard/upgrade?checkout=cancelled&plan=${plan}`,
        completedUrl: `${appUrl}/dashboard/upgrade?checkout=success&plan=${plan}`,
      });
      await recordAuditLog({ action: "payment_plan_change_started", actorId: session.user.id, targetId: portal.id, details: { plan, billing, testMode: config.testMode } });
      return NextResponse.json({ url: portal.url });
    }

    const monthly = await monthlyPriceCents(plan);
    const amountCents = billing === "annual" ? monthly * 10 : monthly;
    const checkout = await createStripeSubscriptionCheckout(config, {
      customerEmail: user?.email,
      productName: `iCloseLeads ${PLAN_LABELS[plan]}`,
      description: `${PLAN_LABELS[plan]} plan subscription`,
      amountCents,
      priceId: stripePriceId(plan, billing),
      interval: billing === "annual" ? "year" : "month",
      idempotencyKey: `plan:${session.user.id}:${plan}:${billing}:${Math.floor(Date.now() / 1_800_000)}`,
      successUrl: `${appUrl}/dashboard/upgrade?checkout=success&plan=${plan}`,
      cancelUrl: `${appUrl}/dashboard/upgrade?checkout=cancelled&plan=${plan}`,
      metadata: {
        purchase_type: "plan",
        user_id: session.user.id,
        plan,
        billing_interval: billing,
      },
    });

    if (!checkout.url) throw new Error("Stripe checkout did not return a payment link.");
    await recordAuditLog({
      action: "payment_checkout_started", actorId: session.user.id,
      targetType: "StripeCheckout", targetId: checkout.id,
      details: { plan, billing, testMode: config.testMode },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    await recordAuditLog({
      action: "payment_checkout_failed",
      actorId: session.user.id,
      actorEmail: session.user.email,
      targetType: "BillingSubscription",
      targetId: plan,
      details: {
        gateway: "stripe",
        purchaseType: "plan",
        plan,
        billing,
        error: error instanceof Error ? error.message : "Could not start secure checkout.",
      },
    });
    console.error("Billing checkout error:", error);
    return NextResponse.json({
      error: "Could not start secure checkout. Please try again.",
    }, { status: 502 });
  }
}
