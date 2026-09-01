export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createStripeSubscriptionCheckout,
  getStripeConfig,
  isStripeCheckoutConfigured,
} from "@/lib/stripe";
import { recordAuditLog } from "@/lib/audit-log";
import { isPlanUpgrade } from "@/lib/plan-limits";
import type { PaidPlan } from "@/lib/plan-pricing";
import { getConfiguredPlanMonthlyPrice } from "@/lib/plan-pricing.server";

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
  const plan = body.plan;
  const billing = body.billing || "monthly";

  if (!plan || !["pro", "agency"].includes(plan) || !["monthly", "annual"].includes(billing)) {
    return NextResponse.json({ error: "Invalid plan or billing interval." }, { status: 400 });
  }

  try {
    const [config, user] = await Promise.all([
      getStripeConfig(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, role: true, plan: true },
      }),
    ]);

    if (!isStripeCheckoutConfigured(config)) {
      return NextResponse.json({
        error: "Stripe checkout is still being configured.",
      }, { status: 503 });
    }

    if (config.testMode && user?.role !== "ADMIN") {
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

    const monthly = await monthlyPriceCents(plan);
    const amountCents = billing === "annual" ? monthly * 10 : monthly;
    const checkout = await createStripeSubscriptionCheckout(config, {
      customerEmail: user?.email,
      productName: `iCloseLeads ${PLAN_LABELS[plan]}`,
      description: `${PLAN_LABELS[plan]} plan subscription`,
      amountCents,
      priceId: stripePriceId(plan, billing),
      interval: billing === "annual" ? "year" : "month",
      successUrl: `${appUrl}/dashboard/upgrade?checkout=success`,
      cancelUrl: `${appUrl}/dashboard/upgrade?checkout=cancelled`,
      metadata: {
        purchase_type: "plan",
        user_id: session.user.id,
        plan,
        billing_interval: billing,
      },
    });

    if (!checkout.url) throw new Error("Stripe checkout did not return a payment link.");
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
      error: error instanceof Error ? error.message : "Could not start secure checkout.",
    }, { status: 502 });
  }
}
