/** @jest-environment node */

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    platformSetting: { findUnique: jest.fn() },
  }
}));

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
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
      name: "John Doe",
      expertise: JSON.stringify(["web-development"]),
      portfolioLinks: "[]",
    });
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const { POST } = await import("@/app/api/proposal/generate/route");
    const req = new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({
        jobTitle: "Webflow landing page build",
        company: "Stripe",
        description: "Need a conversion-focused landing page for developer tools.",
        niche: "web-development",
      }),
    });
    const res = await POST(req);
    const data = await res.json() as { subject: string; body: string; source: string };

    expect(res.status).toBe(200);
    expect(data.subject).toBeTruthy();
    expect(data.body).toContain("Stripe");
    expect(data.source).toBe("template");
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

  it("falls back to a template when no Groq key is available", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ name: "John", expertise: null, portfolioLinks: null });
    (prisma.platformSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const { POST } = await import("@/app/api/proposal/generate/route");
    const req = new NextRequest("http://localhost/api/proposal/generate", {
      method: "POST",
      body: JSON.stringify({ jobTitle: "Website redesign", company: "Acme", niche: "design" }),
    });
    const res = await POST(req);
    const data = await res.json() as { source: string };
    expect(res.status).toBe(200);
    expect(data.source).toBe("template");
  });
});
