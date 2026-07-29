import { createHmac, timingSafeEqual } from "crypto";

import type { BillingInterval, PaidPlan } from "@/lib/lemonsqueezy";

type PriceKey = `${PaidPlan}_${BillingInterval}`;

export interface PaddleConfig {
  apiKey: string;
  clientToken: string;
  webhookSecret: string;
  environment: "sandbox" | "live";
  prices: Record<PriceKey, string>;
}

export function getPaddleConfig(): PaddleConfig {
  const environment = process.env.PADDLE_ENVIRONMENT === "live" ? "live" : "sandbox";
  return {
    apiKey: (process.env.PADDLE_API_KEY || "").trim(),
    clientToken: (process.env.PADDLE_CLIENT_TOKEN || "").trim(),
    webhookSecret: (process.env.PADDLE_WEBHOOK_SECRET || "").trim(),
    environment,
    prices: {
      pro_monthly: (process.env.PADDLE_PRO_MONTHLY_PRICE_ID || "").trim(),
      pro_annual: (process.env.PADDLE_PRO_ANNUAL_PRICE_ID || "").trim(),
      agency_monthly: (process.env.PADDLE_AGENCY_MONTHLY_PRICE_ID || "").trim(),
      agency_annual: (process.env.PADDLE_AGENCY_ANNUAL_PRICE_ID || "").trim(),
    },
  };
}

export function getPaddlePriceId(
  config: PaddleConfig,
  plan: PaidPlan,
  interval: BillingInterval,
) {
  return config.prices[`${plan}_${interval}`];
}

export function getPlanForPaddlePrice(
  config: PaddleConfig,
  priceId: string,
): PaidPlan | null {
  const entry = Object.entries(config.prices).find(([, id]) => id === priceId && id !== "");
  if (!entry) return null;
  return entry[0].startsWith("agency_") ? "agency" : "pro";
}

export function isPaddleCheckoutConfigured(config: PaddleConfig) {
  const clientTokenPrefix = config.environment === "live" ? "live_" : "test_";
  return Boolean(
    config.apiKey
    && config.clientToken.startsWith(clientTokenPrefix)
    && config.webhookSecret
    && Object.values(config.prices).every((id) => /^pri_[a-z0-9]+$/.test(id)),
  );
}

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  now = Date.now(),
) {
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const [key, ...value] = part.split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = Number(parts.ts);
  const signatures = signatureHeader
    .split(";")
    .filter((part) => part.startsWith("h1="))
    .map((part) => part.slice(3));

  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Math.floor(now / 1000) - timestamp) > 5) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const signatureBuffer = Buffer.from(signature, "hex");
    return signatureBuffer.length === expectedBuffer.length
      && timingSafeEqual(signatureBuffer, expectedBuffer);
  });
}

interface PaddleErrorResponse {
  error?: { detail?: string };
}

export async function paddleRequest<T>(
  config: Pick<PaddleConfig, "apiKey" | "environment">,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!config.apiKey) throw new Error("Paddle API key is not configured.");

  const host = config.environment === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
  const response = await fetch(`${host}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as PaddleErrorResponse;
    throw new Error(payload.error?.detail || `Paddle request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}
