import { createHmac } from "crypto";
import { verifyStripeSignature } from "./stripe";

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
});
