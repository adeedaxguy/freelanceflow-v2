import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("bcryptjs", () => ({ __esModule: true, default: { hash: jest.fn() } }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), updateMany: jest.fn() },
  },
}));

import bcrypt from "bcryptjs";
import { createPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";

function request(body: unknown) {
  return { json: async () => body } as unknown as NextRequest;
}

describe("reset password", () => {
  const updatedAt = new Date("2026-09-04T12:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PASSWORD_RESET_SECRET = "test-reset-secret";
    (bcrypt.hash as jest.Mock).mockResolvedValue("new-password-hash");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "google-user",
      password: null,
      updatedAt,
      suspended: false,
    });
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  });

  afterAll(() => { delete process.env.PASSWORD_RESET_SECRET; });

  it("creates the first password for a Google account", async () => {
    const token = createPasswordResetToken({ id: "google-user", updatedAt });
    const result = await POST(request({ token, password: "FreshPass123" }));
    const body = await result.json() as { message: string };

    expect(result.status).toBe(200);
    expect(body.message).toMatch(/sign in with your email/i);
    expect(bcrypt.hash).toHaveBeenCalledWith("FreshPass123", 12);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: "google-user", updatedAt },
      data: { password: "new-password-hash" },
    });
  });

  it("rejects a reused or stale account version", async () => {
    const token = createPasswordResetToken({ id: "google-user", updatedAt });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "google-user",
      updatedAt: new Date(updatedAt.getTime() + 1),
      suspended: false,
    });

    const result = await POST(request({ token, password: "FreshPass123" }));

    expect(result.status).toBe(400);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("rejects an invalid token without touching the account", async () => {
    const result = await POST(request({ token: "invalid", password: "FreshPass123" }));

    expect(result.status).toBe(400);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
