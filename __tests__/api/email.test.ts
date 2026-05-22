jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/resend", () => ({ sendEmail: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    sentEmail: { create: jest.fn() },
    lead: { updateMany: jest.fn() },
  }
}));

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { sendEmail } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

const mockSession = { user: { id: "user-1", email: "test@example.com", role: "USER" as const } };

describe("POST /api/email/send", () => {
  beforeEach(() => { jest.clearAllMocks(); });

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
    (sendEmail as jest.Mock).mockResolvedValue({ id: "email-resend-123", success: true });
    (prisma.sentEmail.create as jest.Mock).mockResolvedValue({
      id: "sent-1", userId: "user-1", subject: "Hello", body: "Hi there!", status: "SENT", resendId: "email-resend-123"
    });

    const { POST } = await import("@/app/api/email/send/route");
    const req = new NextRequest("http://localhost/api/email/send", {
      method: "POST",
      body: JSON.stringify({ to: "prospect@acme.com", subject: "Hello", body: "Hi there, I wanted to reach out about something." }),
    });
    const res = await POST(req);
    const data = await res.json() as { sentEmail: { status: string }; resendId: string };

    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "prospect@acme.com", subject: "Hello" }));
    expect(data.resendId).toBe("email-resend-123");
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
});
