import { ensureAdminMailboxTable } from "@/lib/admin-mailbox";
import { getPlatformEmailStatus, sendPlatformEmail } from "@/lib/admin-notifications";
import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { emailToHtml } from "@/lib/resend";

const SUPPORT_INBOX = "hello@icloseleads.com";
const SUPPORT_ALERT_EMAIL = "adnan.webexpert@gmail.com";

export async function notifySupportRequest(request: {
  id: string;
  source: "contact" | "ticket" | "email";
  email: string;
  subject: string;
  message: string;
}) {
  // Incoming email already reached the primary inbox. Only alert the owner.
  const recipients = request.source === "email"
    ? [SUPPORT_ALERT_EMAIL]
    : [SUPPORT_INBOX, SUPPORT_ALERT_EMAIL];
  const page = request.source === "contact" ? "contacts" : request.source === "ticket" ? "support" : "inbox";
  const subject = `[iCloseLeads Support] ${request.subject.replace(/[\r\n]/g, " ").slice(0, 160)}`;
  const text = `Support needed from ${request.email}\n\n${request.message}\n\nReference: ${request.id}\nReview and reply: https://icloseleads.com/admin/${page}`;

  for (const recipient of recipients) {
    const id = `support-alert:${request.source}:${request.id}:${recipient}`;
    try {
      await ensureAdminMailboxTable();
      const sender = await getPlatformEmailStatus();
      const saved = await prisma.adminMailboxMessage.upsert({
        where: { id },
        update: {},
        create: {
          id, direction: "OUTBOUND", fromEmail: sender.fromEmail, toEmail: recipient,
          subject, body: text, status: "PENDING",
        },
      });
      if (saved.externalId || saved.status === "SENT") continue;

      // A bounded retry uses the same provider key, so it cannot duplicate a send.
      let delivery;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          delivery = await sendPlatformEmail({
            recipient, subject, text, html: emailToHtml(text),
            replyTo: request.email, idempotencyKey: id,
          });
          if (!delivery.success) throw new Error("Support email delivery is not configured");
          break;
        } catch (error) {
          if (attempt === 1 || sender.provider !== "resend") throw error;
        }
      }
      await prisma.adminMailboxMessage.update({
        where: { id },
        data: { status: "SENT", externalId: delivery && "id" in delivery ? delivery.id : undefined },
      });
    } catch (error) {
      console.error("[support-notification] Delivery failed", error);
      await prisma.adminMailboxMessage.updateMany({ where: { id, externalId: null }, data: { status: "FAILED" } }).catch(() => undefined);
      await recordAuditLog({
        action: "support_notification_failed", targetType: request.source, targetId: request.id,
        details: { recipient, error: error instanceof Error ? error.message : "Email delivery failed" },
      });
    }
  }
}
