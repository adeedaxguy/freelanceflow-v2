export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encodePlatformSetting } from "@/lib/platform-secrets";
import { z } from "zod";

const SENSITIVE_SETTINGS = new Set([
  "stripe_secret_key", "stripe_webhook_secret", "lemonsqueezy_api_key",
  "lemonsqueezy_webhook_secret", "groq_api_key", "resend_api_key",
  "yelp_api_key", "here_api_key", "foursquare_api_key", "tomtom_api_key",
  "geoapify_api_key", "radar_api_key", "bing_maps_key", "hunter_api_key", "opencorporates_api_key",
  "opencorporates_api_token", "companies_house_key", "companies_house_api_key",
]);

const ALLOWED_SETTINGS = new Set([
  "site_name", "support_email", "maintenance_mode",
  "pro_price_monthly", "agency_price_monthly",
  "free_leads_per_week", "pro_leads_per_week", "agency_leads_per_week",
  "resend_from_email", ...SENSITIVE_SETTINGS,
  "lemonsqueezy_test_mode", "lemonsqueezy_store_id",
  "lemonsqueezy_pro_monthly_variant_id", "lemonsqueezy_pro_annual_variant_id",
  "lemonsqueezy_agency_monthly_variant_id", "lemonsqueezy_agency_annual_variant_id",
  "lemonsqueezy_softphone_monthly_variant_id",
]);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

// GET all platform settings
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const settings = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
    // Mask sensitive values before sending
    const masked = settings.map(s => ({
      key: s.key,
      value: isSensitiveKey(s.key) && s.value.length > 8
        ? s.value.slice(0, 4) + "••••••••" + s.value.slice(-4)
        : s.value,
      rawLength: s.value.length,
      isSet: s.value.length > 0,
    }));
    return NextResponse.json({ settings: masked });
  } catch (err) {
    console.error("GET settings error:", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// PATCH — update one or many settings
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const schema = z.object({
    updates: z.record(z.string().max(80), z.string().max(10_000)),
  });

  try {
    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const { updates } = parsed.data;
    const entries = Object.entries(updates);
    if (entries.length > 30 || entries.some(([key]) => !ALLOWED_SETTINGS.has(key))) {
      return NextResponse.json({ error: "Unknown setting" }, { status: 400 });
    }

    // Upsert each setting
    await Promise.all(
      entries.filter(([key, value]) => value !== "" || !SENSITIVE_SETTINGS.has(key)).map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { key },
          update: { value: encodePlatformSetting(key, value) },
          create: { key, value: encodePlatformSetting(key, value) },
        })
      )
    );

    return NextResponse.json({ success: true, updated: Object.keys(updates).length });
  } catch (err) {
    console.error("PATCH settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_SETTINGS.has(key) || key.startsWith("smtp_");
}
