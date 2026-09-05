import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/security-rate-limit", () => ({
  getClientIp: jest.fn(() => "127.0.0.1"),
  rateLimitHeaders: jest.fn(() => ({})),
  securityRateLimit: jest.fn(async () => ({ allowed: true, remaining: 4, retryAfterSeconds: 60 })),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    contactSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GET, PATCH, POST } from "./route";

function request(method: string, body?: unknown, query = "") {
  return {
    method,
    headers: new Headers(),
    nextUrl: new URL(`https://icloseleads.com/api/contact${query}`),
    json: async () => body,
  } as unknown as NextRequest;
}

describe("contact route authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(null);
  });

  it("does not expose contact messages publicly", async () => {
    const response = await GET(request("GET"));
    expect(response.status).toBe(403);
    expect(prisma.contactSubmission.findMany).not.toHaveBeenCalled();
  });

  it("lets a current admin load contact messages", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    (prisma.contactSubmission.findMany as jest.Mock).mockResolvedValue([]);
    const response = await GET(request("GET", undefined, "?resolved=false"));
    expect(response.status).toBe(200);
    expect(prisma.contactSubmission.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { resolved: false },
      take: 250,
    }));
  });

  it("does not allow a public visitor to modify a message", async () => {
    const response = await PATCH(request("PATCH", { resolved: true }, "?id=contact-1"));
    expect(response.status).toBe(403);
    expect(prisma.contactSubmission.updateMany).not.toHaveBeenCalled();
  });

  it("accepts a bounded public contact submission without returning its private data", async () => {
    (prisma.contactSubmission.create as jest.Mock).mockResolvedValue({ id: "contact-1" });
    const response = await POST(request("POST", {
      name: "A User",
      email: "USER@example.com",
      message: "Please help me with my account.",
    }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(prisma.contactSubmission.create).toHaveBeenCalledWith({ data: {
      name: "A User",
      email: "user@example.com",
      message: "Please help me with my account.",
    } });
  });
});
