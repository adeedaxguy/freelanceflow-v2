export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { getStripeConfig } from "@/lib/stripe";
import { getConfiguredPlanMonthlyPrice } from "@/lib/plan-pricing.server";
import AdminSettingsClient from "./AdminSettingsClient";

async function getSettings() {
  try {
    await Promise.all([
      getConfiguredPlanMonthlyPrice("pro"),
      getConfiguredPlanMonthlyPrice("agency"),
    ]);
    const rows = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (["stripe_secret_key", "stripe_webhook_secret"].includes(r.key)) continue;
      map[r.key] = r.value;
    }
    map.lemonsqueezy_test_mode ||= "true";
    return map;
  } catch {
    return {};
  }
}

export default async function AdminSettingsPage() {
  const [settings, stripeConfig] = await Promise.all([getSettings(), getStripeConfig()]);
  return (
    <AdminSettingsClient
      initialSettings={settings}
      stripeEnvironment={{
        secretKey: Boolean(stripeConfig.secretKey),
        webhookSecret: Boolean(stripeConfig.webhookSecret),
        mode: stripeConfig.mode,
      }}
      lemonEnvironment={{
        apiKey: Boolean(process.env.LEMONSQUEEZY_API_KEY || process.env.EMONSQUEEZY_API_KEY),
        webhookSecret: Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET),
      }}
    />
  );
}
