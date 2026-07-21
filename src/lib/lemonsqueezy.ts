import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export type PaidPlan = "pro" | "agency";
export type BillingInterval = "monthly" | "annual";

type VariantKey = `${PaidPlan}_${BillingInterval}`;

export interface LemonSqueezyConfig {
  apiKey: string;
  webhookSecret: string;
  storeId: string;
  testMode: boolean;
  variants: Record<VariantKey, string>;
}

const SETTING_KEYS = [
  "lemonsqueezy_store_id",
  "lemonsqueezy_test_mode",
  "lemonsqueezy_pro_monthly_variant_id",
  "lemonsqueezy_pro_annual_variant_id",
  "lemonsqueezy_agency_monthly_variant_id",
  "lemonsqueezy_agency_annual_variant_id",
] as const;

function configuredValue(environmentValue: string | undefined, storedValue: string | undefined) {
  return (environmentValue || storedValue || "").trim();
}

export async function getLemonSqueezyConfig(): Promise<LemonSqueezyConfig> {
  let stored: Record<string, string> = {};
  try {
    const settings = await prisma.platformSetting.findMany({
      where: { key: { in: [...SETTING_KEYS] } },
    });
    stored = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
  } catch {
    // Environment-only configuration still works before the settings table is available.
  }

  const testModeValue = configuredValue(
    process.env.LEMONSQUEEZY_TEST_MODE,
    stored.lemonsqueezy_test_mode,
  );

  return {
    apiKey: (process.env.LEMONSQUEEZY_API_KEY || "").trim(),
    webhookSecret: (process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "").trim(),
    storeId: configuredValue(process.env.LEMONSQUEEZY_STORE_ID, stored.lemonsqueezy_store_id),
    testMode: testModeValue === "" || testModeValue === "true" || testModeValue === "1",
    variants: {
      pro_monthly: configuredValue(
        process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID,
        stored.lemonsqueezy_pro_monthly_variant_id,
      ),
      pro_annual: configuredValue(
        process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID,
        stored.lemonsqueezy_pro_annual_variant_id,
      ),
      agency_monthly: configuredValue(
        process.env.LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID,
        stored.lemonsqueezy_agency_monthly_variant_id,
      ),
      agency_annual: configuredValue(
        process.env.LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID,
        stored.lemonsqueezy_agency_annual_variant_id,
      ),
    },
  };
}

export function getVariantId(
  config: LemonSqueezyConfig,
  plan: PaidPlan,
  interval: BillingInterval,
) {
  return config.variants[`${plan}_${interval}`];
}

export function getPlanForVariant(
  config: LemonSqueezyConfig,
  variantId: string,
): PaidPlan | null {
  const entry = Object.entries(config.variants).find(([, id]) => id === variantId && id !== "");
  if (!entry) return null;
  return entry[0].startsWith("agency_") ? "agency" : "pro";
}

export function hasSubscriptionAccess(status: string) {
  return new Set(["active", "on_trial", "paused", "past_due", "unpaid", "cancelled"]).has(
    status.toLowerCase(),
  );
}

export function verifyLemonSqueezySignature(
  rawBody: string,
  signature: string,
  secret: string,
) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === signatureBuffer.length
    && timingSafeEqual(expectedBuffer, signatureBuffer);
}

interface LemonErrorResponse {
  errors?: Array<{ detail?: string; title?: string }>;
}

export async function lemonSqueezyRequest<T>(
  config: Pick<LemonSqueezyConfig, "apiKey">,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!config.apiKey) throw new Error("Lemon Squeezy API key is not configured.");

  const response = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/vnd.api+json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as LemonErrorResponse;
    throw new Error(
      payload.errors?.[0]?.detail
      || payload.errors?.[0]?.title
      || `Lemon Squeezy request failed (${response.status}).`,
    );
  }

  return response.json() as Promise<T>;
}

export function isCheckoutConfigured(config: LemonSqueezyConfig) {
  return Boolean(
    config.apiKey
    && /^\d+$/.test(config.storeId)
    && Object.values(config.variants).every((id) => /^\d+$/.test(id)),
  );
}
