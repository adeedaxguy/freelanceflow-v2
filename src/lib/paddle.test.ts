import { createHmac } from "crypto";

import {
  getPaddlePriceId,
  getPlanForPaddlePrice,
  isPaddleCheckoutConfigured,
  verifyPaddleSignature,
  type PaddleConfig,
} from "./paddle";

const config: PaddleConfig = {
  apiKey: "pdl_sdbx_apikey",
  clientToken: "test_client_token",
  webhookSecret: "pdl_ntfset_secret",
  environment: "sandbox",
  prices: {
    pro_monthly: "pri_01pro000monthly0000000000",
    pro_annual: "pri_01pro000annual00000000000",
    agency_monthly: "pri_01agency0monthly000000000",
    agency_annual: "pri_01agency0annual0000000000",
  },
};

describe("Paddle billing helpers", () => {
  it("maps plans to prices and back", () => {
    expect(getPaddlePriceId(config, "agency", "annual")).toBe("pri_01agency0annual0000000000");
    expect(getPlanForPaddlePrice(config, "pri_01pro000monthly0000000000")).toBe("pro");
    expect(getPlanForPaddlePrice(config, "pri_missing")).toBeNull();
    expect(isPaddleCheckoutConfigured(config)).toBe(true);
    expect(isPaddleCheckoutConfigured({ ...config, clientToken: "live_wrong_environment" })).toBe(false);
  });

  it("verifies signed raw webhook bodies and rejects stale signatures", () => {
    const rawBody = JSON.stringify({ event_type: "subscription.created" });
    const now = Date.now();
    const timestamp = Math.floor(now / 1000);
    const signature = createHmac("sha256", config.webhookSecret)
      .update(`${timestamp}:${rawBody}`)
      .digest("hex");

    expect(verifyPaddleSignature(
      rawBody,
      `ts=${timestamp};h1=${signature}`,
      config.webhookSecret,
      now,
    )).toBe(true);
    expect(verifyPaddleSignature(
      rawBody,
      `ts=${timestamp - 10};h1=${signature}`,
      config.webhookSecret,
      now,
    )).toBe(false);
  });
});
