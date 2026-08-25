export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStripeConfig, isStripeCheckoutConfigured } from "@/lib/stripe";
import UpgradeClient from "./UpgradeClient";

async function getPlatformPricing() {
  try {
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: { in: ["pro_price_monthly", "agency_price_monthly", "pro_leads_per_week", "agency_leads_per_week"] },
      },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return {
      proPrice:        map["pro_price_monthly"] ?? "29",
      agencyPrice:     map["agency_price_monthly"] ?? "79",
      proLeads:        "1,000",
      agencyLeads:     "Unlimited",
    };
  } catch {
    return { proPrice: "29", agencyPrice: "79", proLeads: "1,000", agencyLeads: "Unlimited" };
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
