export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLemonSqueezyConfig, isCheckoutConfigured } from "@/lib/lemonsqueezy";
import { getPaddleConfig, isPaddleCheckoutConfigured } from "@/lib/paddle";
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

  const provider = process.env.BILLING_PROVIDER === "paddle" ? "PADDLE" : "LEMONSQUEEZY";
  const [pricing, hasBillingSubscription] = await Promise.all([
    getPlatformPricing(),
    prisma.billingSubscription.findFirst({
      where: { userId: session.user.id, provider },
      select: { id: true },
    }).then(Boolean).catch(() => false),
  ]);
  const billingConfig = provider === "PADDLE"
    ? getPaddleConfig()
    : await getLemonSqueezyConfig();
  const currentPlan = (user?.plan ?? "free") as string;
  const billingReady = provider === "PADDLE"
    ? isPaddleCheckoutConfigured(billingConfig as ReturnType<typeof getPaddleConfig>)
    : isCheckoutConfigured(billingConfig as Awaited<ReturnType<typeof getLemonSqueezyConfig>>)
      && Boolean(billingConfig.webhookSecret);
  const billingTestMode = provider === "PADDLE"
    ? (billingConfig as ReturnType<typeof getPaddleConfig>).environment === "sandbox"
    : (billingConfig as Awaited<ReturnType<typeof getLemonSqueezyConfig>>).testMode;
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
