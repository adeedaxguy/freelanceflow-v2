import type { NextRequest } from "next/server";
jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/groq", () => ({ supportChat: jest.fn() }));
jest.mock("@/lib/support-notifications", () => ({ notifySupportRequest: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({ getClientIp: () => "127.0.0.1", rateLimitHeaders: () => ({}), securityRateLimit: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { supportTicket: { create: jest.fn() } } }));

import { getServerSession } from "next-auth";
import { supportChat } from "@/lib/groq";
import { securityRateLimit } from "@/lib/security-rate-limit";
import { notifySupportRequest } from "@/lib/support-notifications";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";
const messages = [{ role: "user", content: "Please help with my billing error" }];
const request = (email?: string) => ({ headers: new Headers(), json: async () => ({ messages, email }) }) as NextRequest;

describe("support chat escalation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(null);
    (supportChat as jest.Mock).mockResolvedValue({ reply: "Escalating", shouldCreateTicket: true });
    (securityRateLimit as jest.Mock).mockResolvedValue({ allowed: true });
    (prisma.supportTicket.create as jest.Mock).mockResolvedValue({ id: "ticket-1" });
  });
  it("asks guests for a reply address instead of inventing one", async () => {
    const response = await POST(request());
    expect(await response.json()).toMatchObject({ ticketCreated: false, needsEmail: true });
    expect(prisma.supportTicket.create).not.toHaveBeenCalled();
  });
  it("persists a guest ticket and alerts the team", async () => {
    const response = await POST(request("guest@example.com"));
    expect(await response.json()).toMatchObject({ ticketCreated: true });
    expect(notifySupportRequest).toHaveBeenCalledWith(expect.objectContaining({ email: "guest@example.com", source: "ticket" }));
    expect(JSON.parse((prisma.supportTicket.create as jest.Mock).mock.calls[0][0].data.messages)[0]).toMatchObject({ role: "user", text: messages[0]!.content });
  });
  it("uses the signed-in account for follow-up", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "user-1", email: "member@example.com" } });
    await POST(request("other@example.com"));
    expect(notifySupportRequest).toHaveBeenCalledWith(expect.objectContaining({ email: "member@example.com" }));
  });
  it("limits human escalations before sending alerts", async () => {
    (securityRateLimit as jest.Mock).mockResolvedValueOnce({ allowed: true }).mockResolvedValueOnce({ allowed: false });
    expect((await POST(request("guest@example.com"))).status).toBe(429);
    expect(notifySupportRequest).not.toHaveBeenCalled();
  });
});
