jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(async () => null),
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { checkAndIncrementLeads, getUsageStats } from "@/lib/usage";

const freeUser = {
  email: "user@example.com",
  plan: "free",
  weeklyLeads: 100,
  weeklyLeadReset: new Date("2026-09-10T12:00:00.000Z"),
  bonusLeads: 0,
  bonusClaimed: null,
  createdAt: new Date("2026-09-10T12:00:00.000Z"),
};

describe("free trial usage", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("shows the remaining allowance during the three-day window", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(freeUser);

    await expect(getUsageStats("user_123")).resolves.toEqual(expect.objectContaining({
      limit: 600,
      used: 100,
      remaining: 500,
      trialExpired: false,
      trialEndsAt: "2026-09-13T12:00:00.000Z",
    }));
  });

  it("blocks new lead usage after the trial ends", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-14T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(freeUser);

    await expect(checkAndIncrementLeads("user_123", 20)).resolves.toEqual({
      allowed: false,
      remaining: 0,
      plan: "free",
      resetAt: "2026-09-13T12:00:00.000Z",
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("reserves the requested leads with a conditional update", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(freeUser);

    await expect(checkAndIncrementLeads("user_123", 50)).resolves.toEqual(expect.objectContaining({
      allowed: true,
      remaining: 450,
      plan: "free",
    }));
    expect(prisma.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ weeklyLeads: { lte: 550 } }),
      data: { weeklyLeads: { increment: 50 } },
    }));
  });

  it("denies a reservation when another request consumed the allowance", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(freeUser);
    (prisma.user.updateMany as jest.Mock).mockResolvedValueOnce({ count: 0 });

    await expect(checkAndIncrementLeads("user_123", 50)).resolves.toEqual(expect.objectContaining({
      allowed: false,
      plan: "free",
    }));
  });
});
