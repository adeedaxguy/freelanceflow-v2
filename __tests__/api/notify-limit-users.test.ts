jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("@/lib/admin-notifications", () => ({
  sendAccountNotification: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: jest.fn() },
    platformSetting: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";
import { sendAccountNotification } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";

describe("POST /api/admin/marketing/notify-limit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{
      id: "user-1",
      name: "A User",
      email: "user@example.com",
      weeklyLeadReset: new Date(),
    }]);
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.platformSetting.create as jest.Mock).mockResolvedValue({ id: "notice-1" });
    (sendAccountNotification as jest.Mock).mockResolvedValue({ success: true, id: "email-1" });
  });

  it("sends one idempotent account notice to an eligible user", async () => {
    const { POST } = await import("@/app/api/admin/marketing/notify-limit/route");
    const response = await POST({
      json: async () => ({ confirm: "notify-free-limit-users" }),
    } as never);

    expect(sendAccountNotification).toHaveBeenCalledTimes(1);
    expect(prisma.platformSetting.create).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toEqual({
      success: true,
      eligible: 1,
      sent: 1,
      skipped: 0,
      failed: [],
    });
  });

  it("does not resend a notice already recorded for the same limit window", async () => {
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({ id: "notice-1" });
    const { POST } = await import("@/app/api/admin/marketing/notify-limit/route");
    const response = await POST({
      json: async () => ({ confirm: "notify-free-limit-users" }),
    } as never);

    expect(sendAccountNotification).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      success: true,
      eligible: 1,
      sent: 0,
      skipped: 1,
      failed: [],
    });
  });
});
