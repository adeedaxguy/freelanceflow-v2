jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) },
}));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/conversion-report", () => ({ getConversionReport: jest.fn() }));
jest.mock("@/lib/stripe", () => ({ getStripeConfig: jest.fn(), stripeRequest: jest.fn() }));

import { getServerSession } from "next-auth";
import { getConversionReport } from "@/lib/conversion-report";
import { getStripeConfig, stripeRequest } from "@/lib/stripe";
import { GET } from "./route";

const subscription = { userId: "customer", plan: "agency", provider: "STRIPE", externalSubscriptionId: "sub_live" };
describe("verified revenue report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin", role: "ADMIN" } });
    (getConversionReport as jest.Mock).mockResolvedValue({ complimentary: 40, liveSubscriptions: [subscription] });
    (getStripeConfig as jest.Mock).mockResolvedValue({ secretKey: "sk_live_mock", testMode: false });
    (stripeRequest as jest.Mock).mockResolvedValue({
      has_more: false,
      data: [
        { id: "sub_live", livemode: true, items: { data: [{ quantity: 1, price: { currency: "usd", unit_amount: 1500, recurring: { interval: "month", interval_count: 1 } } }] } },
        { id: "sub_softphone", livemode: true, items: { data: [] } },
      ],
    });
  });
  it("rejects customer access before reading billing data", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "customer", role: "USER" } });
    expect((await GET()).status).toBe(403);
    expect(getConversionReport).not.toHaveBeenCalled();
  });
  it("counts live subscriptions, never complimentary plan labels, and omits private subscription identifiers", async () => {
    const response = await GET();
    const data = await response.json();
    expect(data).toMatchObject({ baseMrr: 15, subscribers: 1, complimentary: 40, planCounts: { agency: 1, pro: 0 }, stripeError: null });
    expect(data.liveSubscriptions).toBeUndefined();
  });
  it("does not present a Stripe mismatch as zero revenue", async () => {
    (stripeRequest as jest.Mock).mockResolvedValue({ has_more: false, data: [] });
    expect(await (await GET()).json()).toMatchObject({ baseMrr: null, stripeError: expect.any(String) });
  });
  it("counts duplicate subscribers once, preferring their higher plan, and flags the duplicate", async () => {
    (getConversionReport as jest.Mock).mockResolvedValue({ liveSubscriptions: [{ ...subscription, plan: "pro" }, subscription] });
    expect(await (await GET()).json()).toMatchObject({ subscribers: 1, planCounts: { agency: 1, pro: 0 }, duplicateSubscriptions: 1 });
  });
  it("reports unavailable data rather than invented empty history", async () => {
    (getConversionReport as jest.Mock).mockRejectedValue(new Error("Database unavailable"));
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    expect((await GET()).status).toBe(503);
    log.mockRestore();
  });
});
