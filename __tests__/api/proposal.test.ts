jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/openai", () => ({ generateProposal: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: jest.fn() } }
}));

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { generateProposal } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const mockSession = { user: { id: "user-1", email: "test@example.com", role: "USER" as const } };

describe("POST /api/proposal/generate", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/proposal/generate/route");
    const req = new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ targetCompany: "Stripe", targetDomain: "stripe.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("generates a proposal successfully", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      name: "John Doe", niche: "web-development", bio: "Full-stack developer", rate: 100, portfolio: "https://john.dev"
    });
    (generateProposal as jest.Mock).mockResolvedValue({
      subject: "Quick idea for Stripe's developer experience",
      body: "Hi there,\n\nI noticed Stripe has been expanding...",
    });

    const { POST } = await import("@/app/api/proposal/generate/route");
    const req = new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ targetCompany: "Stripe", targetDomain: "stripe.com" }),
    });
    const res = await POST(req);
    const data = await res.json() as { proposal: { subject: string; body: string } };

    expect(res.status).toBe(200);
    expect(data.proposal.subject).toBeTruthy();
    expect(data.proposal.body).toBeTruthy();
  });

  it("returns 400 when required fields missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const { POST } = await import("@/app/api/proposal/generate/route");
    const req = new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 503 when OpenAI key missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ name: "John", niche: "dev" });
    (generateProposal as jest.Mock).mockRejectedValue(new Error("OPENAI_API_KEY is not configured"));

    const { POST } = await import("@/app/api/proposal/generate/route");
    const req = new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ targetCompany: "Acme", targetDomain: "acme.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });
});
