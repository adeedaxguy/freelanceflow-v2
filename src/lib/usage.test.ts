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
  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(freeUser);
  });
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

  it("allows the last millisecond and rejects the exact 72-hour boundary", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-13T11:59:59.999Z"));
    await expect(checkAndIncrementLeads("user_123", 1)).resolves.toMatchObject({ allowed: true });
    jest.setSystemTime(new Date("2026-09-13T12:00:00.000Z"));
    await expect(checkAndIncrementLeads("user_123", 1)).resolves.toMatchObject({ allowed: false });
    await expect(getUsageStats("user_123")).resolves.toMatchObject({ trialExpired: true, remaining: 0 });
  });

  it("does not renew an expired trial weekly or extend it with bonus credits", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-01T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...freeUser, bonusLeads: 300, weeklyLeads: 0 });
    await expect(getUsageStats("user_123")).resolves.toMatchObject({ limit: 900, remaining: 0, trialExpired: true, trialEndsAt: "2026-09-13T12:00:00.000Z" });
    await expect(checkAndIncrementLeads("user_123", 1)).resolves.toMatchObject({ allowed: false });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it.each(["pro", "agency"])("keeps %s usable after the signup trial deadline", async plan => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-14T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...freeUser, plan });
    await expect(getUsageStats("user_123")).resolves.toMatchObject({ trialExpired: false, trialEndsAt: null });
    await expect(checkAndIncrementLeads("user_123", 1)).resolves.toMatchObject({ allowed: true });
  });

  it("does not restart a trial after a paid account returns to free", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-14T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...freeUser, plan: "agency" });
    await expect(getUsageStats("user_123")).resolves.toMatchObject({ trialExpired: false });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(freeUser);
    await expect(getUsageStats("user_123")).resolves.toMatchObject({ trialExpired: true });
  });

  it("gives admins unlimited test usage without giving that bypass to regular users", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-14T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...freeUser, role: "ADMIN" });
    await expect(getUsageStats("user_123")).resolves.toMatchObject({ trialExpired: false, unlimited: true });
    await expect(checkAndIncrementLeads("user_123", 1000)).resolves.toMatchObject({ allowed: true });
  });

  it("enforces the final result and refuses over-reservation", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-11T12:00:00.000Z"));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...freeUser, weeklyLeads: 599 });
    await expect(checkAndIncrementLeads("user_123", 2)).resolves.toMatchObject({ allowed: false, remaining: 1 });
    await expect(checkAndIncrementLeads("user_123", 1)).resolves.toMatchObject({ allowed: true, remaining: 0 });
  });
});
