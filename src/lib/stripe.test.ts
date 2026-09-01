import { createHmac } from "crypto";
import { createStripeSubscriptionCheckout, verifyStripeSignature } from "./stripe";

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
        successUrl: "https://icloseleads.com/success",
        cancelUrl: "https://icloseleads.com/cancel",
        metadata: { plan: "pro" },
      });

      const body = request.mock.calls[0]?.[1]?.body as URLSearchParams;
      expect(body.get("line_items[0][price]")).toBe("price_pro_monthly");
      expect(body.has("line_items[0][price_data][unit_amount]")).toBe(false);
    } finally {
      Reflect.deleteProperty(global, "fetch");
    }
  });
});
