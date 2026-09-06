import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(async () => ({
    user: { id: "user_123", email: "buyer@example.com" },
  })),
}));

jest.mock("@/lib/auth", () => ({ authOptions: {} }));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    billingSubscription: { findFirst: jest.fn(async () => null) },
    user: {
      findUnique: jest.fn(async () => ({
        email: "buyer@example.com",
        role: "USER",
        plan: "free",
      })),
    },
    platformSetting: {
      findUnique: jest.fn(async () => null),
      upsert: jest.fn(async () => ({ value: "10" })),
    },
  },
}));

jest.mock("@/lib/stripe", () => ({
  createStripeBillingPortalSession: jest.fn(async () => ({ id: "bps_123", url: "https://billing.stripe.com/confirm" })),
  createStripeSubscriptionCheckout: jest.fn(async () => ({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/test",
  })),
  getStripeConfig: jest.fn(async () => ({
    secretKey: "sk_live_mock",
    webhookSecret: "whsec_mock",
    mode: "live",
    testMode: false,
  })),
  isStripeCheckoutConfigured: jest.fn(() => true),
}));
jest.mock("@/lib/security-rate-limit", () => ({
  securityRateLimit: jest.fn(async () => ({ allowed: true })),
  rateLimitHeaders: jest.fn(() => ({})),
}));

jest.mock("@/lib/audit-log", () => ({
  recordAuditLog: jest.fn(async () => undefined),
}));

import { prisma } from "@/lib/prisma";
import { createStripeSubscriptionCheckout, createStripeBillingPortalSession, getStripeConfig } from "@/lib/stripe";
import { recordAuditLog } from "@/lib/audit-log";
import { securityRateLimit } from "@/lib/security-rate-limit";
import { POST } from "./route";

function request(plan: string, billing = "monthly") {
  return {
    json: async () => ({ plan, billing }),
    nextUrl: { origin: "https://icloseleads.com" },
  } as unknown as NextRequest;
}

describe("Stripe plan checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: true });
    (prisma.billingSubscription.findFirst as jest.Mock).mockResolvedValue(null);
    delete process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    delete process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID;
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "buyer@example.com",
      role: "USER",
      plan: "free",
    });
    (getStripeConfig as jest.Mock).mockResolvedValue({
      secretKey: "sk_live_mock",
      webhookSecret: "whsec_mock",
      mode: "live",
      testMode: false,
    });
  });

  it("starts checkout for a genuine plan upgrade", async () => {
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    const response = await POST(request("pro"));

    expect(response.status).toBe(200);
    expect(createStripeSubscriptionCheckout).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        amountCents: 1000,
        priceId: "price_pro_monthly",
        metadata: expect.objectContaining({ plan: "pro", purchase_type: "plan" }),
      }),
    );
  });

  it("rejects malformed input without contacting Stripe", async () => {
    expect((await POST({ json: async () => null } as unknown as NextRequest)).status).toBe(400);
    expect(createStripeSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it("rate limits repeated checkout requests without contacting Stripe", async () => {
    (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: false });
    expect((await POST(request("agency"))).status).toBe(429);
    expect(createStripeSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it("applies the annual discount to the Agency price", async () => {
    process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID = "price_agency_annual";
    const response = await POST(request("agency", "annual"));

    expect(response.status).toBe(200);
    expect(createStripeSubscriptionCheckout).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        amountCents: 15000,
        priceId: "price_agency_annual",
        interval: "year",
        metadata: expect.objectContaining({ plan: "agency", billing_interval: "annual" }),
      }),
    );
  });

  it("blocks same-plan and lower-plan live checkouts", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "buyer@example.com",
      role: "USER",
      plan: "agency",
    });

    const same = await POST(request("agency"));
    const lower = await POST(request("pro"));

    expect(same.status).toBe(409);
    expect(lower.status).toBe(409);
    expect(createStripeSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it("keeps lower-tier checkout available to admins in Stripe test mode", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "admin@icloseleads.com",
      role: "ADMIN",
      plan: "agency",
    });
    (getStripeConfig as jest.Mock).mockResolvedValue({
      secretKey: "sk_test_mock",
      webhookSecret: "whsec_mock",
      mode: "test",
      testMode: true,
    });

    const response = await POST(request("pro"));

    expect(response.status).toBe(200);
    expect(createStripeSubscriptionCheckout).toHaveBeenCalled();
  });

  it("changes Pro to Agency without creating a second subscription", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ plan: "pro", role: "USER" });
    (prisma.billingSubscription.findFirst as jest.Mock).mockResolvedValue({
      provider: "STRIPE", status: "active", externalCustomerId: "cus_123", externalSubscriptionId: "sub_123",
    });
    process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID = "price_agency_annual";
    const response = await POST(request("agency", "annual"));
    expect(response.status).toBe(200);
    expect(createStripeSubscriptionCheckout).not.toHaveBeenCalled();
    expect(createStripeBillingPortalSession).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      customerId: "cus_123", subscriptionId: "sub_123", priceId: "price_agency_annual",
    }));
  });

  it("does not sell a second subscription when the account plan is stale", async () => {
    (prisma.billingSubscription.findFirst as jest.Mock).mockResolvedValue({ provider: "PADDLE", status: "active" });
    const response = await POST(request("agency"));
    expect(response.status).toBe(409);
    expect(createStripeSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it("records successful checkout starts, not just failures", async () => {
    await POST(request("pro"));
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "payment_checkout_started", actorId: "user_123",
      details: expect.objectContaining({ plan: "pro", testMode: false }),
    }));
  });

  it("blocks live customers from test mode without losing the diagnostic", async () => {
    (getStripeConfig as jest.Mock).mockResolvedValue({ secretKey: "sk_test_mock", testMode: true });
    expect((await POST(request("pro"))).status).toBe(503);
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "payment_checkout_blocked" }));
    expect(createStripeSubscriptionCheckout).not.toHaveBeenCalled();
  });
});
