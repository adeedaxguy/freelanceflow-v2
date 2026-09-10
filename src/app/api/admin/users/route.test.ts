import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/audit-log", () => ({ recordAuditLog: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { user: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() } } }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GET, PATCH } from "./route";

const request = () => ({ url: "https://icloseleads.com/api/admin/users", json: async () => ({ id: "user-1", plan: "agency" }) }) as NextRequest;

describe("admin user permissions", () => {
  beforeEach(() => jest.resetAllMocks());

  it.each([null, { user: { id: "user-1", role: "USER" } }])("rejects unauthorized reads and writes without touching users: %p", async session => {
    (getServerSession as jest.Mock).mockResolvedValue(session);
    expect((await GET(request())).status).toBe(403);
    expect((await PATCH(request())).status).toBe(403);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("still returns users to an admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ users: [] });
  });

  it("keeps database failures distinct from permission denials", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("unavailable"));
    expect((await GET(request())).status).toBe(500);
  });
});
