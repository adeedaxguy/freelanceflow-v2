/** @jest-environment node */

// Opt-in provider QA. No production database or Twilio provisioning is reachable.
// STRIPE_SANDBOX_PHASE=prepare|verify|cleanup, STRIPE_SANDBOX_SECRET_KEY=sk_test_...
// npm test -- --runInBand --runTestsByPath src/lib/payments.sandbox.test.ts
import { createHmac } from "crypto";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { NextRequest } from "next/server";
import { PLAN_MONTHLY_PRICES } from "./plan-pricing";
import { getCallingPackages } from "./calling-packages";
import { createStripeSubscriptionCheckout, stripeRequest } from "./stripe";
import { POST } from "@/app/api/webhooks/stripe/route";
import { prisma } from "./prisma";
import { provisionPhoneNumber } from "./telephony";
import { recordAuditLog } from "./audit-log";

jest.mock("./prisma", () => ({ prisma: {
  user: { findUnique: jest.fn(async () => ({ role: "ADMIN" })), update: jest.fn() },
  billingSubscription: {
    findUnique: jest.fn(async () => null), findFirst: jest.fn(async () => null), findMany: jest.fn(async () => []),
    upsert: jest.fn(async (input) => input.create), update: jest.fn(),
  },
  telephonyPurchase: {
    findUnique: jest.fn(async ({ where }) => where.id === "sandbox_number"
      ? { id: "sandbox_number", userId: "sandbox_qa", status: "CHECKOUT_PENDING", testMode: true } : null),
    update: jest.fn(), updateMany: jest.fn(async () => ({ count: 1 })),
  },
  platformSetting: { findUnique: jest.fn(async () => null) },
} }));
jest.mock("./platform-secrets", () => ({ getPlatformSetting: jest.fn(async () => "") }));
jest.mock("./telephony", () => ({ provisionPhoneNumber: jest.fn() }));
jest.mock("./audit-log", () => ({ recordAuditLog: jest.fn() }));

type Checkout = {
  name: string; amount: number; interval: "month" | "year";
  metadata: Record<string, string>; id?: string; url?: string | null;
};
const phase = process.env.STRIPE_SANDBOX_PHASE;
const secretKey = process.env.STRIPE_SANDBOX_SECRET_KEY || "";
const config = { secretKey, webhookSecret: "local-sandbox-replay-only", mode: "test" as const, testMode: true };
const output = "reports/stripe-sandbox-checkouts.json";
const cases: Checkout[] = [
  ...(["pro", "agency"] as const).flatMap(plan => (["month", "year"] as const).map(interval => ({
    name: `iCloseLeads ${plan === "pro" ? "Pro" : "Agency"}`,
    amount: PLAN_MONTHLY_PRICES[plan] * 100 * (interval === "year" ? 10 : 1), interval,
    metadata: { purchase_type: "plan", user_id: "sandbox_qa", plan, billing_interval: interval === "year" ? "annual" : "monthly" },
  }))),
  ...getCallingPackages().map(pkg => ({
    name: `iCloseLeads ${pkg.name}`, amount: pkg.priceCents, interval: "month" as const,
    metadata: { purchase_type: "softphone_minutes", user_id: "sandbox_qa", package_id: pkg.id },
  })),
  {
    name: "iCloseLeads number +15005550006", amount: 215, interval: "month",
    metadata: { purchase_type: "softphone_number", user_id: "sandbox_qa", telephony_purchase_id: "sandbox_number" },
  },
];

async function replay(event: Record<string, unknown>) {
  if (event.livemode !== false) throw new Error("Only sandbox events may be replayed");
  const body = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", config.webhookSecret).update(`${timestamp}.${body}`).digest("hex");
  const response = await POST(new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST", body, headers: { "stripe-signature": `t=${timestamp},v1=${signature}` },
  }));
  expect(response.status).toBe(200);
  expect(provisionPhoneNumber).not.toHaveBeenCalled();
  expect(prisma.user.update).not.toHaveBeenCalled();
}

(phase ? describe : describe.skip)("Stripe provider sandbox (explicit opt-in)", () => {
  beforeAll(() => {
    if (!secretKey.startsWith("sk_test_")) throw new Error("Refusing to run without a Stripe test secret key");
    if (!["prepare", "verify", "cleanup"].includes(phase!)) throw new Error("Choose prepare, verify or cleanup");
    process.env.STRIPE_SECRET_KEY = secretKey;
    process.env.STRIPE_WEBHOOK_SECRET = config.webhookSecret;
    process.env.STRIPE_MODE = "test";
  });

  it("creates or verifies checkouts using the existing package amounts", async () => {
    if (phase === "prepare") {
      const prepared: Checkout[] = [];
      for (const entry of cases) {
        const checkout = await createStripeSubscriptionCheckout(config, {
          productName: entry.name, amountCents: entry.amount, interval: entry.interval,
          customerEmail: "sandbox-qa@example.com", metadata: entry.metadata,
          idempotencyKey: `sandbox-qa:${process.env.STRIPE_SANDBOX_RUN_ID || "manual"}:${entry.name}:${entry.interval}`,
          successUrl: "https://icloseleads.com/dashboard/softphone?checkout=sandbox_success",
          cancelUrl: "https://icloseleads.com/dashboard/softphone?checkout=sandbox_cancelled",
        });
        expect(checkout.id).toMatch(/^cs_test_/);
        prepared.push({ ...entry, id: checkout.id, url: checkout.url });
        mkdirSync("reports", { recursive: true });
        writeFileSync(output, JSON.stringify(prepared, null, 2));
      }
      return;
    }

    const prepared: Checkout[] = JSON.parse(readFileSync(output, "utf8"));
    expect(prepared).toHaveLength(cases.length);
    const results = [];
    let startedAt = Number.MAX_SAFE_INTEGER;
    for (const entry of prepared) {
      if (!entry.id?.startsWith("cs_test_")) throw new Error("Refusing a non-test checkout");
      const session = await stripeRequest<Record<string, any>>(config, `/checkout/sessions/${entry.id}`);
      expect(session.livemode).toBe(false);
      startedAt = Math.min(startedAt, session.created);
      expect(session.payment_status).toBe("paid");
      expect(session.amount_total).toBe(entry.amount);
      expect(session.currency).toBe("usd");
      const subscription = await stripeRequest<Record<string, any>>(config, `/subscriptions/${session.subscription}`);
      expect(subscription.livemode).toBe(false);
      if (phase === "cleanup") {
        const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscription.id}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${secretKey}` }, signal: AbortSignal.timeout(15_000),
        });
        expect(response.ok).toBe(true);
        const canceled = await response.json();
        expect(canceled.status).toBe("canceled");
        await replay({ type: "customer.subscription.deleted", livemode: false, data: { object: canceled } });
        results.push({ name: entry.name, interval: entry.interval, subscription: subscription.id, status: canceled.status });
        continue;
      }
      expect(subscription.status).toBe("active");
      expect(subscription.items.data[0].price.recurring.interval).toBe(entry.interval);
      expect(subscription.metadata).toEqual(expect.objectContaining(entry.metadata));
      jest.clearAllMocks();
      await replay({ type: "checkout.session.completed", livemode: false, data: { object: session } });
      await replay({ type: "customer.subscription.updated", livemode: false, data: { object: subscription } });
      if (entry.metadata.purchase_type === "softphone_number") {
        expect(prisma.telephonyPurchase.updateMany).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ testMode: true, status: "PAID_TEST" }),
        }));
      } else {
        expect(prisma.billingSubscription.upsert).toHaveBeenCalledWith(expect.objectContaining({
          create: expect.objectContaining({ testMode: true, status: "active" }),
        }));
      }
      results.push({ name: entry.name, interval: entry.interval, amount: entry.amount, checkout: entry.id, subscription: session.subscription, status: "paid", replay: "passed; isolated database, locally signed" });
    }
    if (phase === "verify") {
      const failures = await stripeRequest<{ data: Array<Record<string, any>> }>(config, `/events?type=payment_intent.payment_failed&created[gte]=${startedAt}&limit=100`);
      expect(failures.data.length).toBeGreaterThan(0);
      for (const event of failures.data) {
        jest.clearAllMocks();
        await replay(event);
        expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
          action: "payment_failed", targetType: "StripePaymentIntent", targetId: event.data.object.id,
          details: expect.objectContaining({ testMode: true }),
        }));
      }
      results.push({ failedPaymentEventsLogged: failures.data.length });
    }
    writeFileSync(`reports/stripe-sandbox-${phase === "cleanup" ? "cleanup" : "results"}.json`, JSON.stringify(results, null, 2));
  }, 180_000);
});
