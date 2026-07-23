import {
  createNumberQuote,
  customerNumberPriceCents,
  decryptTelephonySecret,
  encryptTelephonySecret,
  hasPhoneSubscriptionAccess,
  isSoftphoneAllowed,
  isTelephonyConfigured,
  normalizeDestination,
  selectAuthorizedCallerId,
  verifyNumberQuote,
} from "@/lib/telephony";

describe("telephony security helpers", () => {
  beforeEach(() => {
    process.env.TWILIO_ENCRYPTION_KEY = "test-encryption-key";
    process.env.NEXTAUTH_SECRET = "test-signing-secret";
    delete process.env.TWILIO_SOFTPHONE_ENABLED;
    delete process.env.TWILIO_NUMBER_MARKUP_PERCENT;
    delete process.env.TWILIO_NUMBER_MIN_MARGIN_CENTS;
  });

  it("encrypts secrets and detects tampering", () => {
    const encrypted = encryptTelephonySecret("subaccount-secret");
    expect(encrypted).not.toContain("subaccount-secret");
    expect(decryptTelephonySecret(encrypted)).toBe("subaccount-secret");
    expect(() => decryptTelephonySecret(`${encrypted.slice(0, -1)}x`)).toThrow();
  });

  it("signs a short-lived number quote", () => {
    const quote = createNumberQuote({
      userId: "user-1",
      workspaceId: "workspace-1",
      phoneNumber: "+14155550123",
      country: "US",
      monthlyPriceCents: 115,
      currency: "USD",
    });

    expect(verifyNumberQuote(quote)).toMatchObject({
      userId: "user-1",
      phoneNumber: "+14155550123",
      monthlyPriceCents: 115,
    });
    expect(() => verifyNumberQuote(`${quote.slice(0, -1)}x`)).toThrow("Invalid purchase quote");
  });

  it("adds the configured customer margin to the provider number cost", () => {
    expect(customerNumberPriceCents(115)).toBe(215);
    process.env.TWILIO_NUMBER_MARKUP_PERCENT = "100";
    process.env.TWILIO_NUMBER_MIN_MARGIN_CENTS = "0";
    expect(customerNumberPriceCents(115)).toBe(230);
    expect(() => customerNumberPriceCents(0)).toThrow("pricing is temporarily unavailable");
  });

  it("allows paid phone access and respects a cancelled subscription end date", () => {
    expect(hasPhoneSubscriptionAccess("active")).toBe(true);
    expect(hasPhoneSubscriptionAccess("expired")).toBe(false);
    expect(hasPhoneSubscriptionAccess("cancelled", new Date(Date.now() + 60_000))).toBe(true);
    expect(hasPhoneSubscriptionAccess("cancelled", new Date(Date.now() - 60_000))).toBe(false);
  });

  it("allows ordinary supported destinations and blocks premium routes", () => {
    expect(normalizeDestination("+1 (415) 555-0123")).toBe("+14155550123");
    expect(normalizeDestination("+44 20 7946 0958")).toBe("+442079460958");
    expect(() => normalizeDestination("911")).toThrow("Emergency services");
    expect(() => normalizeDestination("+44 999")).toThrow("Emergency services");
    expect(() => normalizeDestination("+1 900 555 0123")).toThrow("Premium-rate");
    expect(() => normalizeDestination("+44 870 123 4567")).toThrow("Premium-rate");
    expect(() => normalizeDestination("+92 300 1234567")).toThrow("US, Canada, or UK");
  });

  it("uses only an owned active number as caller ID", () => {
    const numbers = ["+14155550123", "+16506634744"];
    expect(selectAuthorizedCallerId(undefined, numbers)).toBe(numbers[0]);
    expect(selectAuthorizedCallerId(numbers[1], numbers)).toBe(numbers[1]);
    expect(() => selectAuthorizedCallerId("+12125550123", numbers)).toThrow("active calling number");
  });

  it("keeps the beta admin-only until explicitly released", () => {
    expect(isSoftphoneAllowed("ADMIN", "free")).toBe(true);
    expect(isSoftphoneAllowed("USER", "agency")).toBe(false);
    process.env.TWILIO_SOFTPHONE_ENABLED = "true";
    expect(isSoftphoneAllowed("USER", "agency")).toBe(true);
    expect(isSoftphoneAllowed("USER", "free")).toBe(false);
  });

  it("requires both parent credentials and the dedicated API key", () => {
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_API_KEY_SID = "SKtest";
    process.env.TWILIO_API_KEY_SECRET = "api-secret";
    delete process.env.TWILIO_AUTH_TOKEN;
    expect(isTelephonyConfigured()).toBe(false);
    process.env.TWILIO_AUTH_TOKEN = "auth-token";
    expect(isTelephonyConfigured()).toBe(true);
  });
});
