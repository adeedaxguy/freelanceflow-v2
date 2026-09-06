jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) },
}));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({ prisma: { billingSubscription: { findFirst: jest.fn() } } }));
jest.mock("@/lib/stripe", () => ({
  getStripeConfig: jest.fn(async () => ({ secretKey: "sk_live_mock", testMode: false })),
  createStripeBillingPortalSession: jest.fn(async () => ({ url: "https://billing.stripe.com/test" })),
}));
jest.mock("@/lib/paddle", () => ({ getPaddleConfig: jest.fn(), paddleRequest: jest.fn() }));
jest.mock("@/lib/lemonsqueezy", () => ({ getLemonSqueezyConfig: jest.fn(), lemonSqueezyRequest: jest.fn() }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createStripeBillingPortalSession } from "@/lib/stripe";
import { POST } from "./route";

describe("plan billing portal", () => {
  beforeEach(() => jest.clearAllMocks());
  it("requires authentication before reading a subscription", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    expect((await POST()).status).toBe(401);
    expect(prisma.billingSubscription.findFirst).not.toHaveBeenCalled();
  });
  it("opens the current user's live plan customer, not a calling add-on or test purchase", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "user_123" } });
    (prisma.billingSubscription.findFirst as jest.Mock).mockResolvedValue({ provider: "STRIPE", externalCustomerId: "cus_plan" });
    expect((await POST()).status).toBe(200);
    expect(prisma.billingSubscription.findFirst).toHaveBeenCalledWith({
      where: { userId: "user_123", testMode: false, plan: { in: ["pro", "agency"] } },
      orderBy: { updatedAt: "desc" },
    });
    expect(createStripeBillingPortalSession).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ customerId: "cus_plan" }));
  });
  it("does not fabricate billing for a complimentary account", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "tester" } });
    (prisma.billingSubscription.findFirst as jest.Mock).mockResolvedValue(null);
    expect((await POST()).status).toBe(404);
    expect(createStripeBillingPortalSession).not.toHaveBeenCalled();
  });
});
