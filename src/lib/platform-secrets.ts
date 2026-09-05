import "server-only";

import { prisma } from "@/lib/prisma";
import { readStoredSecret, sealSecret } from "@/lib/secret-box";

export const PLATFORM_SECRET_KEYS = new Set([
  "stripe_secret_key",
  "stripe_webhook_secret",
  "lemonsqueezy_api_key",
  "lemonsqueezy_webhook_secret",
  "groq_api_key",
  "resend_api_key",
  "yelp_api_key",
  "here_api_key",
  "foursquare_api_key",
  "tomtom_api_key",
  "geoapify_api_key",
  "radar_api_key",
  "bing_maps_key",
  "hunter_api_key",
  "opencorporates_api_key",
  "opencorporates_api_token",
  "companies_house_key",
  "companies_house_api_key",
]);

export function isPlatformSecretKey(key: string) {
  return PLATFORM_SECRET_KEYS.has(key);
}

export function encodePlatformSetting(key: string, value: string) {
  if (!isPlatformSecretKey(key) || value === "" || value.startsWith("enc:v1:")) return value;
  return sealSecret(value);
}

function decodedValue(key: string, value: string) {
  return isPlatformSecretKey(key) ? readStoredSecret(value) ?? "" : value;
}

async function migrateLegacyValue(key: string, storedValue: string, value: string) {
  if (!isPlatformSecretKey(key) || !value || storedValue.startsWith("enc:v1:")) return;
  await prisma.platformSetting.update({
    where: { key },
    data: { value: sealSecret(value) },
  }).catch(() => undefined);
}

export async function getPlatformSetting(key: string) {
  const row = await prisma.platformSetting.findUnique({
    where: { key },
    select: { key: true, value: true },
  }).catch(() => null);
  if (!row) return "";
  const value = decodedValue(row.key, row.value);
  await migrateLegacyValue(row.key, row.value, value);
  return value;
}

export async function getPlatformSettings(keys: readonly string[]) {
  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: [...keys] } },
    select: { key: true, value: true },
  });
  const values: Record<string, string> = {};
  await Promise.all(rows.map(async row => {
    const value = decodedValue(row.key, row.value);
    values[row.key] = value;
    await migrateLegacyValue(row.key, row.value, value);
  }));
  return values;
}
