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
  });

  it("adds a claimed share bonus to the shared free lead allowance", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "free@example.com",
      plan: "free",
      weeklyLeads: 100,
      weeklyLeadReset: new Date(),
      bonusLeads: 300,
      bonusClaimed: JSON.stringify(["share", "share-source:local-leads"]),
    });

    const usage = await getUsageStats("user-free-1");

    expect(usage).toMatchObject({
      plan: "free",
      limit: 400,
      used: 100,
      remaining: 300,
      bonusLeads: 300,
      shareBonusClaimed: true,
      unlimited: false,
    });
  });

  it("keeps an unclaimed free account at the base 100 lead allowance", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: "free@example.com",
      plan: "free",
      weeklyLeads: 100,
      weeklyLeadReset: new Date(),
      bonusLeads: 0,
      bonusClaimed: "[]",
    });

    const usage = await getUsageStats("user-free-1");

    expect(usage).toMatchObject({
      limit: 100,
      used: 100,
      remaining: 0,
      bonusLeads: 0,
      shareBonusClaimed: false,
    });
  });
});
