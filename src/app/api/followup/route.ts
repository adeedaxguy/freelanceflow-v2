import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  leadId:      z.string().min(1),
  step:        z.number().int().min(1).max(10).default(1),
  subject:     z.string().min(1),
  body:        z.string().min(10),
  sendAfterDays: z.number().int().min(1).max(90),
});

const patchSchema = z.object({
  id:      z.string().min(1),
  subject: z.string().optional(),
  body:    z.string().optional(),
  status:  z.enum(["PENDING", "SENT", "CANCELLED"]).optional(),
});

// GET — list follow-ups (optionally filtered by leadId)
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
    const followUps = await (prisma as unknown as {
      followUp: { findMany: (args: unknown) => Promise<unknown[]> }
    }).followUp.findMany({
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
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { leadId, step, subject, body, sendAfterDays } = parsed.data;

  // Verify lead belongs to user
  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: session.user.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Compute scheduledAt: sendAfterDays from now (or from last sentEmail date)
  const scheduledAt = new Date(Date.now() + sendAfterDays * 86_400_000);

  try {
    const followUp = await (prisma as unknown as {
      followUp: { create: (args: unknown) => Promise<unknown> }
    }).followUp.create({
      data: { userId: session.user.id, leadId, step, subject, body, scheduledAt, status: "PENDING" },
    });
    return NextResponse.json({ followUp }, { status: 201 });
  } catch (err) {
    console.error("FollowUp create error:", err);
    return NextResponse.json({ error: "Failed to create follow-up" }, { status: 500 });
  }
}

// PATCH — update subject/body/status
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawBody: unknown;
  try { rawBody = await req.json(); } catch { rawBody = {}; }

  const parsed = patchSchema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { id, ...data } = parsed.data;
  try {
    await (prisma as unknown as {
      followUp: { updateMany: (args: unknown) => Promise<unknown> }
    }).followUp.updateMany({
      where: { id, userId: session.user.id },
      data,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("FollowUp PATCH error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE — cancel / remove a follow-up
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await (prisma as unknown as {
      followUp: { deleteMany: (args: unknown) => Promise<unknown> }
    }).followUp.deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("FollowUp DELETE error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
