import { createHmac } from "crypto";
import {
  getPlanForVariant,
  getVariantId,
  hasSubscriptionAccess,
  type LemonSqueezyConfig,
  verifyLemonSqueezySignature,
} from "./lemonsqueezy";

const config: LemonSqueezyConfig = {
  apiKey: "test-key",
  webhookSecret: "test-secret",
  storeId: "100",
  testMode: true,
  variants: {
    pro_monthly: "101",
    pro_annual: "102",
    agency_monthly: "201",
    agency_annual: "202",
  },
};

describe("Lemon Squeezy billing helpers", () => {
  it("maps plans and billing intervals only through configured variant IDs", () => {
    expect(getVariantId(config, "agency", "annual")).toBe("202");
    expect(getPlanForVariant(config, "101")).toBe("pro");
    expect(getPlanForVariant(config, "201")).toBe("agency");
    expect(getPlanForVariant(config, "999")).toBeNull();
  });

  it("keeps access through Lemon Squeezy grace states but not expiry", () => {
    for (const status of ["active", "on_trial", "paused", "past_due", "unpaid", "cancelled"]) {
      expect(hasSubscriptionAccess(status)).toBe(true);
    }
    expect(hasSubscriptionAccess("expired")).toBe(false);
    expect(hasSubscriptionAccess("unknown")).toBe(false);
  });

  it("verifies a valid webhook signature and rejects tampering", () => {
    const body = JSON.stringify({ data: { id: "123" } });
    const signature = createHmac("sha256", config.webhookSecret).update(body).digest("hex");
    expect(verifyLemonSqueezySignature(body, signature, config.webhookSecret)).toBe(true);
    expect(verifyLemonSqueezySignature(`${body}x`, signature, config.webhookSecret)).toBe(false);
    expect(verifyLemonSqueezySignature(body, "invalid", config.webhookSecret)).toBe(false);
  });
});
