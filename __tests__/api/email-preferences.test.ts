jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

describe("/api/user/email-preferences", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns the persisted marketing preference", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ marketingConsent: true });
    const { GET } = await import("@/app/api/user/email-preferences/route");
    const response = await GET();

    await expect(response.json()).resolves.toEqual({ marketingConsent: true });
  });

  it("updates the persisted marketing preference", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({ marketingConsent: false });
    const { PATCH } = await import("@/app/api/user/email-preferences/route");
    const response = await PATCH({
      json: async () => ({ marketingConsent: false }),
    } as never);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { marketingConsent: false },
      select: { marketingConsent: true },
    });
    await expect(response.json()).resolves.toEqual({
      success: true,
      marketingConsent: false,
    });
  });
});
