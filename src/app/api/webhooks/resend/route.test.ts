import type { NextRequest } from "next/server";
const mockVerify = jest.fn();
const mockReceiving = jest.fn();
jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
jest.mock("@/lib/resend", () => ({ getResendClient: () => ({ webhooks: { verify: mockVerify }, emails: { receiving: { get: mockReceiving } } }) }));
jest.mock("@/lib/admin-mailbox", () => ({ ...jest.requireActual("@/lib/admin-mailbox"), ensureAdminMailboxTable: jest.fn() }));
jest.mock("@/lib/support-notifications", () => ({ notifySupportRequest: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { adminMailboxMessage: { upsert: jest.fn(), updateMany: jest.fn() } } }));
import { prisma } from "@/lib/prisma";
import { notifySupportRequest } from "@/lib/support-notifications";
import { POST } from "./route";
const request = () => ({ headers: new Headers(), text: async () => "signed event" }) as NextRequest;
const incoming = {
  id: "received-1", from: "Customer <customer@example.com>", to: ["support@icloseleads.com"],
  subject: "Help with account", text: "Please help me log in", html: null,
  message_id: "<message@example.com>", created_at: new Date().toISOString(),
};

describe("support email receiving", () => {
  const originalSecret = process.env.RESEND_WEBHOOK_SECRET;
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.RESEND_WEBHOOK_SECRET = "test-webhook-secret";
    mockVerify.mockReturnValue({ type: "email.received", data: { email_id: "received-1", to: ["support@icloseleads.com"] } });
    mockReceiving.mockResolvedValue({ data: incoming, error: null });
    (prisma.adminMailboxMessage.upsert as jest.Mock).mockResolvedValue({ id: "inbox-1", subject: incoming.subject, body: incoming.text });
  });
  afterAll(() => {
    if (originalSecret) process.env.RESEND_WEBHOOK_SECRET = originalSecret;
    else delete process.env.RESEND_WEBHOOK_SECRET;
  });
  it("accepts the support alias, saves email, and alerts the owner", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(prisma.adminMailboxMessage.upsert).toHaveBeenCalled();
    expect(notifySupportRequest).toHaveBeenCalledWith(expect.objectContaining({ source: "email", email: "customer@example.com", id: "inbox-1" }));
  });
  it("does not loop or duplicate owner alerts for our own notifications", async () => {
    mockReceiving.mockResolvedValue({ data: { ...incoming, from: "iCloseLeads <hello@icloseleads.com>" }, error: null });
    await POST(request());
    expect(prisma.adminMailboxMessage.upsert).toHaveBeenCalled();
    expect(notifySupportRequest).not.toHaveBeenCalled();
  });
  it("rejects forged events before accessing mail or sending alerts", async () => {
    mockVerify.mockImplementation(() => { throw new Error("bad signature"); });
    expect((await POST(request())).status).toBe(400);
    expect(mockReceiving).not.toHaveBeenCalled();
    expect(notifySupportRequest).not.toHaveBeenCalled();
  });
  it("ignores mail intended for another address", async () => {
    mockVerify.mockReturnValue({ type: "email.received", data: { to: ["other@example.com"], received_for: [] } });
    expect(await (await POST(request())).json()).toMatchObject({ ignored: true });
    expect(mockReceiving).not.toHaveBeenCalled();
  });
  it("preserves delivery-status updates for outgoing notifications", async () => {
    mockVerify.mockReturnValue({ type: "email.delivered", data: { email_id: "outbound-1", message_id: "message-1" } });
    await POST(request());
    expect(prisma.adminMailboxMessage.updateMany).toHaveBeenCalledWith({ where: { externalId: "outbound-1" }, data: { status: "DELIVERED", messageId: "message-1" } });
    expect(notifySupportRequest).not.toHaveBeenCalled();
  });
});
