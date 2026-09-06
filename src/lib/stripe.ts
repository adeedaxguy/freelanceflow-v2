import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { getPlatformSetting } from "@/lib/platform-secrets";

export type StripeConfig = {
  secretKey: string;
  webhookSecret: string;
  mode: "test" | "live";
  testMode: boolean;
};

async function stored(key: string) {
  return (await getPlatformSetting(key)).trim();
}

export async function getStripeConfig(): Promise<StripeConfig> {
  const secretKey = process.env.STRIPE_SECRET_KEY || await stored("stripe_secret_key");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || await stored("stripe_webhook_secret");
  const modeValue = (process.env.STRIPE_MODE || await stored("stripe_mode") || "test").toLowerCase();
  const mode = modeValue === "live" ? "live" : "test";
  return {
    secretKey,
    webhookSecret,
    mode,
    testMode: mode !== "live" || secretKey.startsWith("sk_test_"),
  };
}

export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
  toleranceSeconds = 300,
  now = Date.now(),
) {
  const parts = signature.split(",");
  const timestamp = Number(parts.find(part => part.startsWith("t="))?.slice(2));
  const signatures = parts
    .filter(part => part.startsWith("v1="))
    .map(part => part.slice(3))
    .filter(Boolean);
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (toleranceSeconds > 0 && Math.abs(Math.floor(now / 1000) - timestamp) > toleranceSeconds) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some(value => {
    const received = Buffer.from(value, "hex");
    return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
  });
}

export async function stripeRequest<T>(config: StripeConfig, path: string, body?: URLSearchParams, idempotencyKey?: string) {
  if (!config.secretKey) throw new Error("Stripe secret key is not configured.");
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.error?.message === "string"
      ? payload.error.message
      : `Stripe request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}

type CheckoutInput = {
  customerEmail?: string | null;
  productName: string;
  description?: string;
  amountCents: number;
  priceId?: string;
  idempotencyKey?: string;
  currency?: string;
  interval?: "month" | "year";
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
};

export async function createStripeSubscriptionCheckout(config: StripeConfig, input: CheckoutInput) {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Stripe checkout amount is invalid.");
  }
  const body = new URLSearchParams({
    mode: "subscription",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "payment_method_types[0]": "card",
    "line_items[0][quantity]": "1",
  });

  if (input.priceId) {
    body.set("line_items[0][price]", input.priceId);
  } else {
    body.set("line_items[0][price_data][currency]", (input.currency || "USD").toLowerCase());
    body.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
    body.set("line_items[0][price_data][recurring][interval]", input.interval || "month");
    body.set("line_items[0][price_data][product_data][name]", input.productName);
    if (input.description) {
      body.set("line_items[0][price_data][product_data][description]", input.description);
    }
  }
  if (input.customerEmail) body.set("customer_email", input.customerEmail);
  for (const [key, value] of Object.entries(input.metadata)) {
    if (value === null || value === undefined) continue;
    body.set(`metadata[${key}]`, String(value));
    body.set(`subscription_data[metadata][${key}]`, String(value));
  }
  return stripeRequest<{ id: string; url: string | null }>(config, "/checkout/sessions", body, input.idempotencyKey);
}

export function isStripeCheckoutConfigured(config: StripeConfig) {
  return Boolean(config.secretKey && config.webhookSecret);
}

export async function createStripeBillingPortalSession(
  config: StripeConfig,
  input: { customerId: string; returnUrl: string; subscriptionId?: string; priceId?: string; completedUrl?: string },
) {
  const body = new URLSearchParams({
    customer: input.customerId,
    return_url: input.returnUrl,
  });
  if (input.subscriptionId && input.priceId) {
    const subscription = await stripeRequest<{
      customer: string;
      items: { data: Array<{ id: string; quantity: number }> };
    }>(config, `/subscriptions/${encodeURIComponent(input.subscriptionId)}`);
    if (subscription.customer !== input.customerId) throw new Error("Subscription customer does not match.");
    const item = subscription.items.data[0];
    if (!item || subscription.items.data.length !== 1) throw new Error("Manage this subscription in billing settings.");
    body.set("flow_data[type]", "subscription_update_confirm");
    body.set("flow_data[subscription_update_confirm][subscription]", input.subscriptionId);
    body.set("flow_data[subscription_update_confirm][items][0][id]", item.id);
    body.set("flow_data[subscription_update_confirm][items][0][price]", input.priceId);
    body.set("flow_data[subscription_update_confirm][items][0][quantity]", String(item.quantity || 1));
    body.set("flow_data[after_completion][type]", "redirect");
    body.set("flow_data[after_completion][redirect][return_url]", input.completedUrl ?? input.returnUrl);
  }
  return stripeRequest<{ id: string; url: string }>(config, "/billing_portal/sessions", body);
}
