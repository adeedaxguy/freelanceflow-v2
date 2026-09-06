jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { count: jest.fn(async () => 0) },
    billingSubscription: { findMany: jest.fn(async () => []) },
    $queryRaw: jest.fn(async () => []),
  },
}));
import { prisma } from "@/lib/prisma";
import { getConversionReport, CUSTOMER_FILTER, LIVE_PLAN_FILTER } from "./conversion-report";

describe("customer conversion cohort", () => {
  beforeEach(() => jest.clearAllMocks());
  it("uses the same signup cohort and excludes staff and test subscriptions", async () => {
    const now = new Date("2026-09-07T00:00:00Z");
    const result = await getConversionReport(now);
    expect(result.since).toBe("2026-08-08T00:00:00.000Z");
    expect(prisma.user.count).toHaveBeenCalledWith({ where: CUSTOMER_FILTER });
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ role: "USER", createdAt: { gte: new Date(result.since) }, billingSubscriptions: { some: LIVE_PLAN_FILTER } }),
    });
    expect(prisma.billingSubscription.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ testMode: false, status: "active", plan: { in: ["pro", "agency"] } }),
    }));
  });
  it("reports missing event history as unknown, not zero attempts", async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error("Unavailable"));
    expect((await getConversionReport()).events).toBeNull();
  });
});
