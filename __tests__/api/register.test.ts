jest.mock("bcryptjs", () => ({ hash: jest.fn() }));
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("@/lib/admin-notifications", () => ({ notifyNewUserSignup: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import bcrypt from "bcryptjs";
import { notifyNewUserSignup } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";

const validBody = {
  name: "New User",
  email: "NewUser@Example.com",
  password: "StrongPass123",
  expertise: ["web design", "seo"],
  referralSource: "Google",
};

function registerRequest(body = validBody) {
  return { json: async () => body } as never;
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "New User",
      email: "newuser@example.com",
      plan: "free",
    });
    (notifyNewUserSignup as jest.Mock).mockResolvedValue({ success: true, id: "email-1" });
  });

  it("creates a user and sends an admin signup notification", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(registerRequest());

    expect(res.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: "newuser@example.com",
        plan: "free",
      }),
    }));
    expect(notifyNewUserSignup).toHaveBeenCalledWith({
      id: "user-1",
      name: "New User",
      email: "newuser@example.com",
      plan: "free",
      expertise: ["web design", "seo"],
      referralSource: "Google",
    });
  });

  it("does not fail signup when the admin notification fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (notifyNewUserSignup as jest.Mock).mockRejectedValue(new Error("Resend down"));

    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(registerRequest());

    expect(res.status).toBe(201);
    expect(notifyNewUserSignup).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
