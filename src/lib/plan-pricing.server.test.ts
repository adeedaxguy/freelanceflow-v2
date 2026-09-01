jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(async () => undefined),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getConfiguredPlanMonthlyPrice } from "@/lib/plan-pricing.server";

describe("configured plan pricing", () => {
  beforeEach(() => jest.clearAllMocks());

  it("migrates the legacy Pro price", async () => {
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({ value: "29" });

    await expect(getConfiguredPlanMonthlyPrice("pro")).resolves.toBe(10);
    expect(prisma.platformSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { value: "10" },
    }));
  });

  it("migrates the legacy Agency price", async () => {
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({ value: "79" });

    await expect(getConfiguredPlanMonthlyPrice("agency")).resolves.toBe(15);
    expect(prisma.platformSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { value: "15" },
    }));
  });

  it("preserves a later custom admin price", async () => {
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({ value: "12" });

    await expect(getConfiguredPlanMonthlyPrice("pro")).resolves.toBe(12);
    expect(prisma.platformSetting.upsert).not.toHaveBeenCalled();
  });
});

