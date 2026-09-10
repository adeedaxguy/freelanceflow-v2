jest.mock("resend", () => ({ Resend: jest.fn() }));
jest.mock("@/lib/admin-mailbox", () => ({ ensureAdminMailboxTable: jest.fn() }));
jest.mock("@/lib/admin-notifications", () => ({ getPlatformEmailStatus: jest.fn(), sendPlatformEmail: jest.fn() }));
jest.mock("@/lib/audit-log", () => ({ recordAuditLog: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: { adminMailboxMessage: {
  upsert: jest.fn(), update: jest.fn(), updateMany: jest.fn(),
} } }));

import { getPlatformEmailStatus, sendPlatformEmail } from "@/lib/admin-notifications";
import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { notifySupportRequest } from "./support-notifications";

const request = { id: "ticket-1", source: "ticket" as const, email: "customer@example.com", subject: "Help\r\nplease", message: "<script>alert(1)</script>" };

describe("support notifications", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (getPlatformEmailStatus as jest.Mock).mockResolvedValue({ provider: "resend", fromEmail: "hello@icloseleads.com" });
    (sendPlatformEmail as jest.Mock).mockResolvedValue({ success: true, provider: "resend", id: "email-1" });
    (prisma.adminMailboxMessage.upsert as jest.Mock).mockResolvedValue({ status: "PENDING", externalId: null });
    (prisma.adminMailboxMessage.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  });

  it("emails both inboxes, sets the customer's reply address, and escapes message HTML", async () => {
    await notifySupportRequest(request);
    expect(sendPlatformEmail).toHaveBeenCalledTimes(2);
    expect((sendPlatformEmail as jest.Mock).mock.calls.map(([mail]) => mail.recipient)).toEqual(["hello@icloseleads.com", "adnan.webexpert@gmail.com"]);
    expect(sendPlatformEmail).toHaveBeenCalledWith(expect.objectContaining({
      replyTo: "customer@example.com", subject: "[iCloseLeads Support] Help  please",
      html: expect.stringContaining("&lt;script&gt;"),
      idempotencyKey: expect.stringContaining("support-alert:ticket:ticket-1:"),
    }));
  });

  it("alerts only Gmail for email already received by the primary inbox", async () => {
    await notifySupportRequest({ ...request, source: "email" });
    expect(sendPlatformEmail).toHaveBeenCalledTimes(1);
    expect(sendPlatformEmail).toHaveBeenCalledWith(expect.objectContaining({ recipient: "adnan.webexpert@gmail.com" }));
  });

  it("does not resend a notification accepted by the provider", async () => {
    (prisma.adminMailboxMessage.upsert as jest.Mock).mockResolvedValue({ externalId: "email-existing", status: "DELIVERED" });
    await notifySupportRequest(request);
    expect(sendPlatformEmail).not.toHaveBeenCalled();
  });

  it("retries a failed provider request with an identical key", async () => {
    (sendPlatformEmail as jest.Mock).mockRejectedValueOnce(new Error("timeout"));
    await notifySupportRequest(request);
    expect(sendPlatformEmail).toHaveBeenCalledTimes(3);
    expect((sendPlatformEmail as jest.Mock).mock.calls[0]).toEqual((sendPlatformEmail as jest.Mock).mock.calls[1]);
  });

  it("records delivery failures without losing support or blocking the other recipient", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    (sendPlatformEmail as jest.Mock).mockRejectedValueOnce(new Error("unavailable")).mockRejectedValueOnce(new Error("unavailable"));
    await expect(notifySupportRequest(request)).resolves.toBeUndefined();
    expect(recordAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "support_notification_failed", targetId: "ticket-1" }));
    expect(sendPlatformEmail).toHaveBeenLastCalledWith(expect.objectContaining({ recipient: "adnan.webexpert@gmail.com" }));
    jest.restoreAllMocks();
  });
});
