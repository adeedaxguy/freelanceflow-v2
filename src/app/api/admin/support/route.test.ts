import type { NextRequest } from "next/server";
jest.mock("resend", () => ({ Resend: jest.fn() }));
jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("@/lib/support-notifications", () => ({ notifySupportRequest: jest.fn() }));
jest.mock("@/lib/admin-notifications", () => ({ sendPlatformEmail: jest.fn() }));
jest.mock("@/lib/security-rate-limit", () => ({ getClientIp: () => "127.0.0.1", rateLimitHeaders: () => ({}), securityRateLimit: jest.fn(async () => ({ allowed: true })) }));
jest.mock("@/lib/prisma", () => ({ prisma: { supportTicket: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() } } }));

import { getServerSession } from "next-auth";
import { sendPlatformEmail } from "@/lib/admin-notifications";
import { notifySupportRequest } from "@/lib/support-notifications";
import { prisma } from "@/lib/prisma";
import { GET, POST, PATCH } from "./route";
const request = (body = {}) => ({ url: "https://icloseleads.com/api/admin/support", headers: new Headers(), json: async () => body }) as NextRequest;

describe("human support", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(null);
    (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: true });
    (prisma.supportTicket.create as jest.Mock).mockResolvedValue({ id: "ticket-1" });
    (prisma.supportTicket.findUnique as jest.Mock).mockResolvedValue({ messages: "[]", email: "customer@example.com", subject: "Account help" });
    (prisma.supportTicket.update as jest.Mock).mockResolvedValue({ id: "ticket-1", messages: "[]" });
  });
  it("accepts guest requests and notifies support", async () => {
    const response = await POST(request({ email: "guest@example.com", subject: "Account help", message: "I cannot access my account" }));
    expect(response.status).toBe(201);
    expect(notifySupportRequest).toHaveBeenCalledWith(expect.objectContaining({ source: "ticket", id: "ticket-1" }));
  });
  it("does not let visitors read tickets or send staff replies", async () => {
    expect((await GET(request())).status).toBe(403);
    expect((await PATCH(request({ id: "ticket-1", reply: "hello" }))).status).toBe(403);
    expect(sendPlatformEmail).not.toHaveBeenCalled();
  });
  it("emails replies and returns the updated ticket", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin-1", role: "ADMIN", email: "admin@icloseleads.com" } });
    const response = await PATCH(request({ id: "ticket-1", reply: "We can help." }));
    expect(response.status).toBe(200);
    expect(sendPlatformEmail).toHaveBeenCalledWith(expect.objectContaining({ recipient: "customer@example.com", replyTo: "hello@icloseleads.com", text: "We can help." }));
    expect(await response.json()).toMatchObject({ ticket: { id: "ticket-1" } });
  });
  it("does not save a reply as sent when email delivery fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    (sendPlatformEmail as jest.Mock).mockRejectedValue(new Error("provider unavailable"));
    expect((await PATCH(request({ id: "ticket-1", reply: "We can help." }))).status).toBe(502);
    expect(prisma.supportTicket.update).not.toHaveBeenCalled();
  });
});
