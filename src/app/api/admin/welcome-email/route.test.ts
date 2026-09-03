import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(async () => ({ user: { id: "admin-1", role: "ADMIN" } })),
}));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/admin-notifications", () => ({
  WELCOME_EMAIL_KEY_PREFIX: "welcome_email_",
  sendWelcomeEmail: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: jest.fn() },
    platformSetting: { findMany: jest.fn() },
  },
}));

import { sendWelcomeEmail } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

function request(body: unknown) {
  return {
    headers: new Headers(),
    json: async () => body,
  } as unknown as NextRequest;
}

describe("recent welcome email backfill", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findMany as jest.Mock).mockReset().mockResolvedValue([{
      id: "user-1",
      name: "Alex",
      email: "alex@example.com",
      createdAt: new Date(),
    }]);
    (prisma.platformSetting.findMany as jest.Mock)
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{
        key: "welcome_email_user-1",
        value: JSON.stringify({ status: "sent" }),
        updatedAt: new Date(),
      }]);
    (sendWelcomeEmail as jest.Mock).mockReset().mockResolvedValue({ success: true, skipped: false });
  });

  it("requires an explicit confirmation", async () => {
    const response = await POST(request({}));

    expect(response.status).toBe(400);
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("sends once to active users created in the last seven days", async () => {
    const response = await POST(request({ confirm: "SEND_RECENT_WELCOMES" }));
    const body = await response.json() as { delivered: number; remaining: number; failed: unknown[] };

    expect(response.status).toBe(200);
    expect(sendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({
      id: "user-1",
      email: "alex@example.com",
    }));
    expect(body).toEqual(expect.objectContaining({ delivered: 1, remaining: 0, failed: [] }));
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ suspended: false, createdAt: { gte: expect.any(Date) } }),
    }));
  });
});
