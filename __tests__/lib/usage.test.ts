/** @jest-environment node */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getUsageStats } from "@/lib/usage";

describe("getUsageStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-08-30T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("adds a claimed share bonus to the shared free lead allowance", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "free@example.com",
      plan: "free",
      weeklyLeads: 100,
      weeklyLeadReset: new Date("2026-08-30T00:00:00.000Z"),
      bonusLeads: 300,
      bonusClaimed: JSON.stringify(["share", "share-source:local-leads"]),
      createdAt: new Date("2026-08-30T00:00:00.000Z"),
    });

    const usage = await getUsageStats("user-free-1");

    expect(usage).toMatchObject({
      plan: "free",
      limit: 900,
      used: 100,
      remaining: 800,
      bonusLeads: 300,
      shareBonusClaimed: true,
      unlimited: false,
    });
  });

  it("keeps an unclaimed free account at the base 600 lead allowance", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "free@example.com",
      plan: "free",
      weeklyLeads: 100,
      weeklyLeadReset: new Date("2026-08-30T00:00:00.000Z"),
      bonusLeads: 0,
      bonusClaimed: "[]",
      createdAt: new Date("2026-08-30T00:00:00.000Z"),
    });

    const usage = await getUsageStats("user-free-1");

    expect(usage).toMatchObject({
      limit: 600,
      used: 100,
      remaining: 500,
      bonusLeads: 0,
      shareBonusClaimed: false,
    });
  });

  it("starts existing users with a fresh rollout allowance", async () => {
    const expiredReset = new Date(Date.now() - 8 * 24 * 3_600_000);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "free@example.com",
      plan: "free",
      weeklyLeads: 100,
      weeklyLeadReset: expiredReset,
      bonusLeads: 0,
      bonusClaimed: "[]",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    const before = Date.now();
    const usage = await getUsageStats("user-free-1");

    expect(usage).toMatchObject({
      limit: 600,
      used: 0,
      remaining: 600,
    });
    expect(new Date(usage!.nextReset).getTime()).toBeGreaterThan(before);
  });
});
