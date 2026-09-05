import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("@/lib/admin-notifications", () => ({ sendPlatformEmail: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({
  getClientIp: jest.fn(() => "127.0.0.1"),
  securityRateLimit: jest.fn(async () => ({ allowed: true, remaining: 5, retryAfterSeconds: 60 })),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    platformSetting: { findUnique: jest.fn(), upsert: jest.fn() },
  },
}));

import { sendPlatformEmail } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

function request(body: unknown) {
  return { json: async () => body, headers: new Headers() } as unknown as NextRequest;
}

describe("forgot password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PASSWORD_RESET_SECRET = "test-reset-secret";
    process.env.NEXT_PUBLIC_APP_URL = "https://icloseleads.com";
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.platformSetting.upsert as jest.Mock).mockResolvedValue({});
    (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: true, provider: "resend", id: "email-1" });
  });

  afterAll(() => {
    delete process.env.PASSWORD_RESET_SECRET;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("sends a reset link to an OAuth-only account", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "oauth-user",
      email: "oauth@example.com",
      updatedAt: new Date("2026-09-04T12:00:00Z"),
      suspended: false,
      password: null,
    });

    const result = await POST(request({ email: " OAuth@Example.com " }));
    const body = await result.json() as { message: string };

    expect(result.status).toBe(200);
    expect(body.message).toMatch(/reset link/i);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: "oauth@example.com" } }));
    expect(sendPlatformEmail).toHaveBeenCalledWith(expect.objectContaining({
      recipient: "oauth@example.com",
      subject: "Reset your iCloseLeads password",
      html: expect.stringContaining("/auth/reset-password?token="),
    }));
  });

  it("returns the same response without sending for an unknown email", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await POST(request({ email: "missing@example.com" }));
    const body = await result.json() as { message: string };

    expect(result.status).toBe(200);
    expect(body.message).toMatch(/reset link/i);
    expect(sendPlatformEmail).not.toHaveBeenCalled();
  });

  it("throttles repeated email requests", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      updatedAt: new Date(),
      suspended: false,
    });
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue({ updatedAt: new Date() });

    const result = await POST(request({ email: "user@example.com" }));

    expect(result.status).toBe(200);
    expect(sendPlatformEmail).not.toHaveBeenCalled();
  });
});
