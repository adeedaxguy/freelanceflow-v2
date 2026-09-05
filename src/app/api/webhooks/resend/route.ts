export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { ensureAdminMailboxTable, extractEmailAddress, plainTextFromEmail } from "@/lib/admin-mailbox";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/resend";

const DELIVERY_STATUSES: Record<string, string> = {
  "email.sent": "SENT",
  "email.delivered": "DELIVERED",
  "email.delivery_delayed": "DELAYED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.failed": "FAILED",
  "email.suppressed": "SUPPRESSED",
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const payload = await req.text();
  let event;
  try {
    event = getResendClient().webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  await ensureAdminMailboxTable();

  if (event.type === "email.received") {
    const mailbox = (process.env.RESEND_FROM_EMAIL ?? "hello@icloseleads.com").toLowerCase();
    const recipients = [...event.data.to, ...event.data.received_for].map((value) => extractEmailAddress(value).toLowerCase());
    if (!recipients.includes(mailbox)) return NextResponse.json({ received: true, ignored: true });

    const { data, error } = await getResendClient().emails.receiving.get(event.data.email_id);
    if (error || !data) return NextResponse.json({ error: "Email could not be retrieved." }, { status: 502 });

    await prisma.adminMailboxMessage.upsert({
      where: { externalId: data.id },
      update: {
        fromEmail: extractEmailAddress(data.from),
        toEmail: data.to.join(", "),
        subject: data.subject || "(No subject)",
        body: plainTextFromEmail(data.text, data.html),
      },
      create: {
        externalId: data.id,
        messageId: data.message_id,
        direction: "INBOUND",
        fromEmail: extractEmailAddress(data.from),
        toEmail: data.to.join(", "),
        subject: data.subject || "(No subject)",
        body: plainTextFromEmail(data.text, data.html),
        status: "RECEIVED",
        createdAt: new Date(data.created_at),
      },
    });
    return NextResponse.json({ received: true });
  }

  const status = DELIVERY_STATUSES[event.type];
  if (status && "email_id" in event.data) {
    await prisma.adminMailboxMessage.updateMany({
      where: { externalId: event.data.email_id },
      data: { status, messageId: event.data.message_id },
    });
  }

  return NextResponse.json({ received: true });
}
