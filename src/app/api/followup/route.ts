export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { z } from "zod";

// Type alias for the Prisma followUp delegate we access via casting
type FollowUpDelegate = {
  findMany:   (args: unknown) => Promise<unknown[]>;
  create:     (args: unknown) => Promise<unknown>;
  updateMany: (args: unknown) => Promise<unknown>;
  deleteMany: (args: unknown) => Promise<unknown>;
  findFirst:  (args: unknown) => Promise<Record<string, unknown> | null>;
};
const fu = () => (prisma as unknown as { followUp: FollowUpDelegate }).followUp;

const createSchema = z.object({
  leadId:        z.string().min(1),
  step:          z.number().int().min(1).max(10).default(1),
  subject:       z.string().min(1).max(300),
  body:          z.string().min(10).max(10_000),
  sendAfterDays: z.number().int().min(1).max(90),
});

const patchSchema = z.object({
  id:      z.string().min(1),
  subject: z.string().max(300).optional(),
  body:    z.string().max(10_000).optional(),
  /** Setting status to SENT triggers actual email delivery */
  status:  z.enum(["PENDING", "READY_TO_SEND", "SENT", "CANCELLED"]).optional(),
});

// GET — list follow-ups (optionally filtered by leadId / status)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (leadId) where.leadId = leadId;
  if (status) where.status = status;

  try {
    const followUps = await fu().findMany({
      where,
      orderBy: [{ leadId: "asc" }, { step: "asc" }],
      include: { lead: { select: { company: true, domain: true, email: true } } },
    });
    return NextResponse.json({ followUps });
  } catch (err) {
    console.error("FollowUp GET error:", err);
    return NextResponse.json({ followUps: [] });
  }
}

// POST — create a follow-up step for a lead
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }

  const parsed = createSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { leadId, step, subject, body, sendAfterDays } = parsed.data;

  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: session.user.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const scheduledAt = new Date(Date.now() + sendAfterDays * 86_400_000);

  try {
    const followUp = await fu().create({
      data: { userId: session.user.id, leadId, step, subject, body, scheduledAt, status: "PENDING" },
    });
    return NextResponse.json({ followUp }, { status: 201 });
  } catch (err) {
    console.error("FollowUp create error:", err);
    return NextResponse.json({ error: "Failed to create follow-up" }, { status: 500 });
  }
}

// PATCH — update content or mark as SENT (triggers real email delivery)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }

  const parsed = patchSchema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { id, status, ...rest } = parsed.data;

  // Fetch the follow-up to get subject, body, and lead email
  const existing = await fu().findFirst({
    where: { id, userId: session.user.id },
    include: { lead: { select: { email: true, company: true } } },
  }) as (Record<string, unknown> & { lead?: { email?: string; company?: string } }) | null;

  if (!existing) return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });

  // ── If marking as SENT, actually deliver the email ────────────────────────
  let emailError: string | null = null;
  if (status === "SENT" && existing.status !== "SENT") {
    const toEmail = existing.lead?.email as string | undefined;
    const subject = (rest.subject ?? existing.subject) as string;
    const body    = (rest.body    ?? existing.body)    as string;

    if (toEmail) {
      const result = await sendMail(session.user.id, {
        to:      toEmail,
        subject,
        text:    body,
        fromName: undefined, // resolved inside sendMail
      });
      if (!result.success) {
        emailError = result.error ?? "Email delivery failed";
        // Don't mark as SENT if email didn't go out — return error
        return NextResponse.json({ error: emailError }, { status: result.code === "OUTREACH_LIMIT" ? 429 : 502 });
      }
      // Log in sentEmails
      await prisma.sentEmail.create({
        data: {
          userId:  session.user.id,
          leadId:  existing.leadId as string,
          subject,
          body,
          status:  "SENT",
        },
      }).catch(() => null);
    }
    // No email on lead — still allow marking sent (manual sends)
  }

  const updateData: Record<string, unknown> = { ...rest };
  if (status) {
    updateData.status = status;
    if (status === "SENT") updateData.sentAt = new Date();
  }

  try {
    await fu().updateMany({ where: { id, userId: session.user.id }, data: updateData });
    return NextResponse.json({ success: true, emailSent: status === "SENT" && !emailError });
  } catch (err) {
    console.error("FollowUp PATCH error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE — remove a follow-up
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await fu().deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("FollowUp DELETE error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
