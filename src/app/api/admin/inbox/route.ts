export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { ensureAdminMailboxTable, extractEmailAddress } from "@/lib/admin-mailbox";
import { getPlatformEmailStatus } from "@/lib/admin-notifications";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailToHtml, getResendClient } from "@/lib/resend";

const sendSchema = z.object({
  to: z.string().trim().email().max(320),
  subject: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(20_000),
  replyToId: z.string().optional(),
});
const readSchema = z.object({ id: z.string().min(1) });

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && session.user.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  await ensureAdminMailboxTable();

  const [messages, inbox, unread, sent, failed, sender] = await Promise.all([
    prisma.adminMailboxMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.adminMailboxMessage.count({ where: { direction: "INBOUND" } }),
    prisma.adminMailboxMessage.count({ where: { direction: "INBOUND", readAt: null } }),
    prisma.adminMailboxMessage.count({ where: { direction: "OUTBOUND" } }),
    prisma.adminMailboxMessage.count({ where: { direction: "OUTBOUND", status: { in: ["BOUNCED", "FAILED", "COMPLAINED", "SUPPRESSED"] } } }),
    getPlatformEmailStatus(),
  ]);
  return NextResponse.json({ messages, counts: { inbox, unread, sent, failed }, sender });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const parsed = sendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email." }, { status: 400 });

  await ensureAdminMailboxTable();
  const sender = await getPlatformEmailStatus();
  if (!sender.configured || sender.provider !== "resend") {
    return NextResponse.json({ error: "Verify hello@icloseleads.com in Resend before sending." }, { status: 503 });
  }

  const { to, subject, body, replyToId } = parsed.data;
  const parent = replyToId ? await prisma.adminMailboxMessage.findUnique({ where: { id: replyToId } }) : null;
  const threadHeaders = parent?.messageId ? { "In-Reply-To": parent.messageId, References: parent.messageId } : undefined;
  const { data, error } = await getResendClient().emails.send({
    from: `iCloseLeads <${sender.fromEmail}>`,
    to: [extractEmailAddress(to)],
    subject,
    text: body,
    html: emailToHtml(body),
    replyTo: sender.fromEmail,
    headers: threadHeaders,
  });
  if (error || !data?.id) return NextResponse.json({ error: "Email could not be sent." }, { status: 502 });

  const message = await prisma.adminMailboxMessage.create({
    data: {
      externalId: data.id,
      direction: "OUTBOUND",
      fromEmail: sender.fromEmail,
      toEmail: extractEmailAddress(to),
      subject,
      body,
      status: "SENT",
      replyToId: parent?.id,
    },
  });
  return NextResponse.json({ message }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const parsed = readSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  await ensureAdminMailboxTable();
  await prisma.adminMailboxMessage.updateMany({
    where: { id: parsed.data.id, direction: "INBOUND", readAt: null },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
