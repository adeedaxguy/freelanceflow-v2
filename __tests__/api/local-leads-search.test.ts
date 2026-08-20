/** @jest-environment node */

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/usage", () => ({
  checkAndIncrementLeads: jest.fn(),
  getUsageStats: jest.fn(),
}));
jest.mock("@/lib/local-leads-engine", () => ({
  searchLocalBusinesses: jest.fn(),
  checkRateLimit: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    platformSetting: { findMany: jest.fn() },
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { checkAndIncrementLeads, getUsageStats } from "@/lib/usage";
import { checkRateLimit, searchLocalBusinesses } from "@/lib/local-leads-engine";

const mockSession = {
  user: { id: "user-free-1", email: "free@example.com", plan: "free" },
};

let NextRequest: typeof import("next/server").NextRequest;

describe("POST /api/local-leads/search", () => {
  beforeAll(async () => {
    ({ NextRequest } = await import("next/server"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (checkRateLimit as jest.Mock).mockReturnValue(true);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ plan: "free" });
    (prisma.platformSetting.findMany as jest.Mock).mockResolvedValue([]);
  });

  it("returns 429 when the free user has no remaining lead allowance", async () => {
    (getUsageStats as jest.Mock).mockResolvedValue({
      plan: "free",
      limit: 100,
      used: 100,
      remaining: 0,
      nextReset: "2026-07-02T00:00:00.000Z",
      percentage: 100,
    });

    const { POST } = await import("@/app/api/local-leads/search/route");
    const req = new NextRequest("http://localhost/api/local-leads/search", {
      method: "POST",
      body: JSON.stringify({ keyword: "cleaning service", location: "Houston, TX" }),
    });

    const res = await POST(req);
    const data = await res.json() as { error: string; limit: number; bonusAvailable: boolean };

    expect(res.status).toBe(429);
    expect(data.limit).toBe(100);
    expect(data.bonusAvailable).toBe(true);
    expect(data.error).toContain("Weekly limit reached");
    expect(searchLocalBusinesses).not.toHaveBeenCalled();
    expect(checkAndIncrementLeads).not.toHaveBeenCalled();
  });

  it("caps local results to the remaining free allowance and updates usage", async () => {
    (getUsageStats as jest.Mock)
      .mockResolvedValueOnce({
        plan: "free",
        limit: 100,
        used: 98,
        remaining: 2,
        nextReset: "2026-07-02T00:00:00.000Z",
        percentage: 98,
      })
      .mockResolvedValueOnce({
        plan: "free",
        limit: 100,
        used: 100,
        remaining: 0,
        nextReset: "2026-07-02T00:00:00.000Z",
        percentage: 100,
      });

    (searchLocalBusinesses as jest.Mock).mockResolvedValue({
      leads: [
        { id: "lead-1", name: "A1 Cleaning", address: "1 Main St" },
        { id: "lead-2", name: "A2 Cleaning", address: "2 Main St" },
        { id: "lead-3", name: "A3 Cleaning", address: "3 Main St" },
      ],
      source: "osm",
      sources: ["osm"],
      total: 3,
      geocoded: true,
    });
    (checkAndIncrementLeads as jest.Mock).mockResolvedValue({
      allowed: true,
      remaining: 0,
      plan: "free",
    });

    const { POST } = await import("@/app/api/local-leads/search/route");
    const req = new NextRequest("http://localhost/api/local-leads/search", {
      method: "POST",
      body: JSON.stringify({ keyword: "cleaning service", location: "Houston, TX" }),
    });

    const res = await POST(req);
    const data = await res.json() as {
      results: Array<{ id: string }>;
      total: number;
      totalAvailable: number;
      capped: boolean;
      usage: { used: number; remaining: number };
    };

    expect(res.status).toBe(200);
    expect(data.results).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.totalAvailable).toBe(3);
    expect(data.capped).toBe(true);
    expect(data.usage.used).toBe(100);
    expect(data.usage.remaining).toBe(0);
    expect(checkAndIncrementLeads).toHaveBeenCalledWith("user-free-1", 2);
  });
});
