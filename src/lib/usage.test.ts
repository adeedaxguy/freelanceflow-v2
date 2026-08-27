jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(async () => null),
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
});
