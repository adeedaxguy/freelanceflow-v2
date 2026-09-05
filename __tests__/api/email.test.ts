/** @jest-environment node */

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/mailer", () => ({ sendMail: jest.fn() }));
jest.mock("@/lib/outreach-limits", () => ({ getResolvedOutreachUsage: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({
  getClientIp: jest.fn(() => "127.0.0.1"),
  rateLimitHeaders: jest.fn(() => ({})),
  securityRateLimit: jest.fn(async () => ({ allowed: true, remaining: 9, retryAfterSeconds: 60 })),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    sentEmail: { create: jest.fn() },
    lead: { create: jest.fn(), findFirst: jest.fn(), updateMany: jest.fn() },
  }
}));

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { sendMail } from "@/lib/mailer";
import { getResolvedOutreachUsage } from "@/lib/outreach-limits";
import { prisma } from "@/lib/prisma";

const mockSession = { user: { id: "user-1", email: "test@example.com", role: "USER" as const } };
const mockUsage = {
  plan: "free",
  daily: 50,
  monthly: 400,
  perMinute: 5,
  label: "Free",
  usedToday: 1,
  usedThisMonth: 1,
  usedThisMinute: 1,
  remainingToday: 49,
  remainingThisMonth: 399,
  nextDailyReset: "2026-07-20T00:00:00.000Z",
  nextMonthlyReset: "2026-08-01T00:00:00.000Z",
};

describe("POST /api/email/send", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getResolvedOutreachUsage as jest.Mock).mockResolvedValue(mockUsage);
  });

  it("returns 401 when unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const { POST } = await import("@/app/api/email/send/route");
    const req = new NextRequest("http://localhost/api/email/send", {
      method: "POST",
      body: JSON.stringify({ to: "prospect@acme.com", subject: "Hello", body: "Hi there!" }),
    });
    expect((await POST(req)).status).toBe(401);
  });

  it("sends an email and logs it successfully", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ name: "John Doe", email: "john@example.com" });
    (sendMail as jest.Mock).mockResolvedValue({ id: "email-provider-123", success: true, provider: "smtp" });
    (prisma.sentEmail.create as jest.Mock).mockResolvedValue({
      id: "sent-1", userId: "user-1", subject: "Hello", body: "Hi there!", status: "SENT", resendId: "email-provider-123"
    });

    const { POST } = await import("@/app/api/email/send/route");
    const req = new NextRequest("http://localhost/api/email/send", {
      method: "POST",
      body: JSON.stringify({ to: "prospect@acme.com", subject: "Hello", body: "Hi there, I wanted to reach out about something." }),
    });
    const res = await POST(req);
    const data = await res.json() as { success: boolean; id: string };

    expect(res.status).toBe(200);
    expect(sendMail).toHaveBeenCalledWith("user-1", expect.objectContaining({ to: "prospect@acme.com", subject: "Hello" }));
    expect(data.success).toBe(true);
    expect(data.id).toBe("email-provider-123");
  });

  it("returns 400 with invalid email address", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const { POST } = await import("@/app/api/email/send/route");
    const req = new NextRequest("http://localhost/api/email/send", {
      method: "POST",
      body: JSON.stringify({ to: "not-an-email", subject: "Hello", body: "Hi there!" }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("does not allow attaching another user's lead", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue(null);

    const { POST } = await import("@/app/api/email/send/route");
    const req = new NextRequest("http://localhost/api/email/send", {
      method: "POST",
      body: JSON.stringify({
        to: "prospect@acme.com",
        subject: "Hello",
        body: "Hi there, I wanted to reach out about something.",
        leadId: "someone-elses-lead",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(sendMail).not.toHaveBeenCalled();
  });
});
