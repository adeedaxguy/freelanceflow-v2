export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStripeConfig, isStripeCheckoutConfigured } from "@/lib/stripe";
import { PLAN_MONTHLY_PRICES } from "@/lib/plan-pricing";
import { getConfiguredPlanMonthlyPrice } from "@/lib/plan-pricing.server";
import UpgradeClient from "./UpgradeClient";

async function getPlatformPricing() {
  try {
    const [proPrice, agencyPrice] = await Promise.all([
      getConfiguredPlanMonthlyPrice("pro"),
      getConfiguredPlanMonthlyPrice("agency"),
    ]);
    return {
      proPrice:        String(proPrice),
      agencyPrice:     String(agencyPrice),
      proLeads:        "1,000",
      agencyLeads:     "Unlimited",
    };
  } catch {
    return {
      proPrice: String(PLAN_MONTHLY_PRICES.pro),
      agencyPrice: String(PLAN_MONTHLY_PRICES.agency),
      proLeads: "1,000",
      agencyLeads: "Unlimited",
    };
  }
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams?: { checkout?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      email: true,
      role: true,
    },
  });

  const [pricing, hasBillingSubscription] = await Promise.all([
    getPlatformPricing(),
    prisma.billingSubscription.findFirst({
      where: { userId: session.user.id, provider: "STRIPE" },
      select: { id: true },
    }).then(Boolean).catch(() => false),
  ]);
  const billingConfig = await getStripeConfig();
  const currentPlan = (user?.plan ?? "free") as string;
  const billingReady = isStripeCheckoutConfigured(billingConfig);
  const billingTestMode = billingConfig.testMode;
  const canCheckout = billingReady && (!billingTestMode || user?.role === "ADMIN");

  return (
    <UpgradeClient
      currentPlan={currentPlan}
      userEmail={user?.email ?? ""}
      pricing={pricing}
      billingReady={billingReady}
      billingTestMode={billingTestMode}
      canCheckout={canCheckout}
      hasBillingSubscription={hasBillingSubscription}
      checkoutReturned={searchParams?.checkout === "success"}
    />
  );
}
