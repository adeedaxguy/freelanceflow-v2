/** @jest-environment node */

import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
jest.mock("@/lib/leads-aggregator", () => ({ aggregateLeadsWithDiagnostics: jest.fn() }));
jest.mock("@/lib/usage", () => ({
  checkAndIncrementLeads: jest.fn(),
  getUsageStats: jest.fn(),
}));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { aggregateLeadsWithDiagnostics } from "@/lib/leads-aggregator";
import { checkAndIncrementLeads, getUsageStats } from "@/lib/usage";

const mockSession = { user: { id: "user-1", name: "Test User", email: "test@example.com", role: "USER" as const } };
const mockUsage = {
  plan: "free",
  limit: 100,
  used: 0,
  remaining: 100,
  nextReset: "2026-07-20T00:00:00.000Z",
  percentage: 0,
};

describe("POST /api/leads/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUsageStats as jest.Mock).mockResolvedValue(mockUsage);
    (checkAndIncrementLeads as jest.Mock).mockResolvedValue(undefined);
    (prisma.lead.findMany as jest.Mock).mockResolvedValue([]);
  });

  it("returns 401 when not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/leads/search/route");
    const req = new NextRequest("http://localhost/api/leads/search", {
      method: "POST",
      body: JSON.stringify({ domain: "stripe.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns aggregated leads when a niche is valid", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (aggregateLeadsWithDiagnostics as jest.Mock).mockResolvedValue({
      leads: [
        {
          id: "lead-1",
          title: "Need a Webflow landing page",
          company: "Acme Studio",
          domain: "acme.example",
          description: "Looking for a landing page specialist.",
          source: "reddit",
          sourceUrl: "https://example.com/job",
          confidence: 82,
          qualityScore: 82,
          tags: ["web-design"],
        },
      ],
      diagnostics: { totalFetched: 1, errors: [] },
    });

    const { POST } = await import("@/app/api/leads/search/route");
    const req = new NextRequest("http://localhost/api/leads/search", {
      method: "POST",
      body: JSON.stringify({ niche: "web-design", maxHours: 24 }),
    });
    const res = await POST(req);
    const data = await res.json() as { leads: unknown[]; total: number };

    expect(res.status).toBe(200);
    expect(data.leads).toHaveLength(1);
    expect(data.total).toBe(1);
    expect(checkAndIncrementLeads).toHaveBeenCalledWith("user-1", 1);
  });

  it("returns 400 when neither domain nor company provided", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const { POST } = await import("@/app/api/leads/search/route");
    const req = new NextRequest("http://localhost/api/leads/search", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 when lead aggregation fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (aggregateLeadsWithDiagnostics as jest.Mock).mockRejectedValue(new Error("source failed"));
    const { POST } = await import("@/app/api/leads/search/route");
    const req = new NextRequest("http://localhost/api/leads/search", {
      method: "POST",
      body: JSON.stringify({ niche: "web-design" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/leads/save", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue(null);
  });

  it("saves a lead and returns 201", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const mockLead = { id: "lead-1", company: "Stripe", domain: "stripe.com", email: "john@stripe.com", userId: "user-1" };
    (prisma.lead.create as jest.Mock).mockResolvedValue(mockLead);

    const { POST } = await import("@/app/api/leads/save/route");
    const req = new NextRequest("http://localhost/api/leads/save", {
      method: "POST",
      body: JSON.stringify({ company: "Stripe", domain: "stripe.com", email: "john@stripe.com", confidence: 95 }),
    });
    const res = await POST(req);
    const data = await res.json() as { lead: typeof mockLead };

    expect(res.status).toBe(201);
    expect(data.lead.company).toBe("Stripe");
  });
});
