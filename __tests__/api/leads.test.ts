import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { lead: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), deleteMany: jest.fn() } } }));
jest.mock("@/lib/hunter", () => ({ searchDomain: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { searchDomain } from "@/lib/hunter";

const mockSession = { user: { id: "user-1", name: "Test User", email: "test@example.com", role: "USER" as const } };

describe("POST /api/leads/search", () => {
  beforeEach(() => { jest.clearAllMocks(); });

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

  it("returns leads when domain is valid", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (searchDomain as jest.Mock).mockResolvedValue({
      domain: "stripe.com",
      organization: "Stripe",
      total: 2,
      emails: [
        { value: "john@stripe.com", type: "personal", confidence: 95, firstName: "John", lastName: "Smith", position: "CTO" },
        { value: "hr@stripe.com", type: "generic", confidence: 72 },
      ],
    });

    const { POST } = await import("@/app/api/leads/search/route");
    const req = new NextRequest("http://localhost/api/leads/search", {
      method: "POST",
      body: JSON.stringify({ domain: "stripe.com" }),
    });
    const res = await POST(req);
    const data = await res.json() as { leads: unknown[]; total: number; organization: string };

    expect(res.status).toBe(200);
    expect(data.leads).toHaveLength(2);
    expect(data.organization).toBe("Stripe");
    expect(data.total).toBe(2);
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

  it("returns 503 when Hunter.io key missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (searchDomain as jest.Mock).mockRejectedValue(new Error("HUNTER_API_KEY is not configured"));
    const { POST } = await import("@/app/api/leads/search/route");
    const req = new NextRequest("http://localhost/api/leads/search", {
      method: "POST",
      body: JSON.stringify({ domain: "stripe.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });
});

describe("POST /api/leads/save", () => {
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
