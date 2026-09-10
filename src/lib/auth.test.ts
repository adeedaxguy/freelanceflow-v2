jest.mock("@/lib/admin-notifications", () => ({ notifyNewUserSignup: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({
  getClientIp: jest.fn(() => "127.0.0.1"),
  securityRateLimit: jest.fn(async () => ({ allowed: true, remaining: 5, retryAfterSeconds: 60 })),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { authOptions } from "./auth";

describe("authenticated session revocation", () => {
  const jwt = authOptions.callbacks?.jwt as NonNullable<typeof authOptions.callbacks>["jwt"];
  const session = authOptions.callbacks?.session as NonNullable<typeof authOptions.callbacks>["session"];

  it("invalidates a session when the account is suspended", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      role: "USER",
      plan: "pro",
      suspended: true,
      sessionVersion: 2,
    });
    const token = await jwt!({ token: { id: "user-1", sessionVersion: 2 } } as never);
    expect(token).toEqual(expect.objectContaining({ active: false }));
    expect(token.id).toBeUndefined();
  });

  it("invalidates older sessions after a security version change", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      role: "USER",
      plan: "free",
      suspended: false,
      sessionVersion: 3,
    });
    const token = await jwt!({ token: { id: "user-1", sessionVersion: 2 } } as never);
    const value = await session!({
      session: { user: { id: "user-1" }, expires: "2099-01-01" },
      token,
    } as never);
    expect(value).toBeNull();
  });

  it("refreshes role and plan from the database for an active session", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      role: "ADMIN",
      plan: "agency",
      suspended: false,
      sessionVersion: 4,
    });
    const token = await jwt!({ token: { id: "user-1", sessionVersion: 4 } } as never);
    expect(token).toEqual(expect.objectContaining({
      active: true,
      role: "ADMIN",
      plan: "agency",
    }));
  });

  it("keeps the original signup time when an existing Google user signs in again", async () => {
    const createdAt = new Date("2026-09-01T12:00:00Z");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "google-user", role: "USER", plan: "free", suspended: false, createdAt, sessionVersion: 0 });
    const user = { id: "google-id", email: "returning@example.com" };
    const signIn = authOptions.callbacks!.signIn!;
    const result = await signIn({ user, account: { provider: "google", providerAccountId: "google-id", type: "oauth" } } as never);
    expect(result).toBe(true);
    expect(user).toMatchObject({ id: "google-user", createdAt: createdAt.toISOString() });
  });
});
