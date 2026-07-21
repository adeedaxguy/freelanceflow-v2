export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import AdminSettingsClient from "./AdminSettingsClient";

async function getSettings() {
  try {
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
  const settings = await getSettings();
  return (
    <AdminSettingsClient
      initialSettings={settings}
      lemonEnvironment={{
        apiKey: Boolean(process.env.LEMONSQUEEZY_API_KEY),
        webhookSecret: Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET),
      }}
    />
  );
}
