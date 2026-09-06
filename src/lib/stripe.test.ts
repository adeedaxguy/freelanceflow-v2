/** @jest-environment node */

import { createHmac } from "crypto";
import { createStripeSubscriptionCheckout, createStripeBillingPortalSession, verifyStripeSignature } from "./stripe";

function signature(body: string, secret: string, timestamp: number) {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

describe("Stripe helpers", () => {
  it("verifies signed webhook bodies and rejects stale or tampered payloads", () => {
    const body = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
    const secret = "whsec_test";
    const timestamp = 1_700_000_000;
    const header = signature(body, secret, timestamp);

    expect(verifyStripeSignature(body, header, secret, 300, timestamp * 1000)).toBe(true);
    expect(verifyStripeSignature(`${body}x`, header, secret, 300, timestamp * 1000)).toBe(false);
    expect(verifyStripeSignature(body, header, secret, 300, (timestamp + 301) * 1000)).toBe(false);
  });

  it("uses a saved Stripe price without creating inline product data", async () => {
    const request = jest.fn(async (_url: string, _options?: RequestInit) => ({
      ok: true,
      json: async () => ({ id: "cs_live", url: "https://checkout.stripe.com/live" }),
    } as Response));
    Object.defineProperty(global, "fetch", { configurable: true, value: request });

    try {
      await createStripeSubscriptionCheckout({
        secretKey: "sk_live_test",
        webhookSecret: "whsec_test",
        mode: "live",
        testMode: false,
      }, {
        productName: "iCloseLeads Pro",
        amountCents: 1000,
        priceId: "price_pro_monthly",
        idempotencyKey: "plan:user:pro:monthly:1",
        successUrl: "https://icloseleads.com/success",
        cancelUrl: "https://icloseleads.com/cancel",
        metadata: { plan: "pro" },
      });

      const body = request.mock.calls[0]?.[1]?.body as URLSearchParams;
      expect(body.get("line_items[0][price]")).toBe("price_pro_monthly");
      expect(body.has("line_items[0][price_data][unit_amount]")).toBe(false);
      expect(request.mock.calls[0]?.[1]?.headers).toEqual(expect.objectContaining({ "Idempotency-Key": "plan:user:pro:monthly:1" }));
    } finally {
      Reflect.deleteProperty(global, "fetch");
    }
  });

  it("builds an owner-checked Stripe confirmation flow without changing or charging the subscription", async () => {
    const request = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ customer: "cus_123", items: { data: [{ id: "si_123", quantity: 1 }] } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "bps_123", url: "https://billing.stripe.com/confirm" }) });
    Object.defineProperty(global, "fetch", { configurable: true, value: request });
    try {
      await createStripeBillingPortalSession({ secretKey: "sk_live_mock", webhookSecret: "", mode: "live", testMode: false }, {
        customerId: "cus_123", subscriptionId: "sub_123", priceId: "price_agency", returnUrl: "https://icloseleads.com/dashboard/upgrade?checkout=cancelled",
        completedUrl: "https://icloseleads.com/dashboard/upgrade?checkout=success",
      });
      expect(request.mock.calls[0][1].method).toBe("GET");
      const body = request.mock.calls[1][1].body as URLSearchParams;
      expect(body.get("flow_data[type]")).toBe("subscription_update_confirm");
      expect(body.get("flow_data[subscription_update_confirm][items][0][id]")).toBe("si_123");
      expect(body.get("flow_data[subscription_update_confirm][items][0][price]")).toBe("price_agency");
      expect(body.get("return_url")).toContain("checkout=cancelled");
      expect(body.get("flow_data[after_completion][redirect][return_url]")).toContain("checkout=success");
      expect(request.mock.calls[1][0]).toBe("https://api.stripe.com/v1/billing_portal/sessions");
    } finally { Reflect.deleteProperty(global, "fetch"); }
  });
});
