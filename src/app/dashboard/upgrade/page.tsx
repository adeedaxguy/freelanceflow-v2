export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLemonSqueezyConfig, isCheckoutConfigured } from "@/lib/lemonsqueezy";
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
      proLeads:        map["pro_leads_per_week"] ?? "100",
      agencyLeads:     map["agency_leads_per_week"] ?? "500",
    };
  } catch {
    return { proPrice: "29", agencyPrice: "79", proLeads: "100", agencyLeads: "500" };
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

  const [pricing, billingConfig, hasBillingSubscription] = await Promise.all([
    getPlatformPricing(),
    getLemonSqueezyConfig(),
    prisma.billingSubscription.findFirst({
      where: { userId: session.user.id, provider: "LEMONSQUEEZY" },
      select: { id: true },
    }).then(Boolean).catch(() => false),
  ]);
  const currentPlan = (user?.plan ?? "free") as string;
  const billingReady = isCheckoutConfigured(billingConfig) && Boolean(billingConfig.webhookSecret);
  const canCheckout = billingReady && (!billingConfig.testMode || user?.role === "ADMIN");

  return (
    <UpgradeClient
      currentPlan={currentPlan}
      userEmail={user?.email ?? ""}
      pricing={pricing}
      billingReady={billingReady}
      billingTestMode={billingConfig.testMode}
      canCheckout={canCheckout}
      hasBillingSubscription={hasBillingSubscription}
      checkoutReturned={searchParams?.checkout === "success"}
    />
  );
}
