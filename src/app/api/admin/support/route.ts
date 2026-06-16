export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? ""))
    throw new Error("Forbidden");
  return session;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status   = searchParams.get("status") ?? "all";
    const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit    = 20;

    const where: Record<string, unknown> = {};
    if (status !== "all") where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, plan: true } } },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    const counts = await prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    return NextResponse.json({
      tickets, total,
      page, totalPages: Math.ceil(total / limit),
      counts: counts.map(c => ({ status: c.status, cnt: c._count._all })),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json() as {
      email: string; subject: string; message: string;
      category?: string; priority?: string;
    };

    const messages = JSON.stringify([{
      role: "user",
      text: body.message,
      at: new Date().toISOString(),
    }]);

    await prisma.supportTicket.create({
      data: {
        userId:   session?.user?.id ?? null,
        email:    body.email,
        subject:  body.subject,
        messages,
        status:   "open",
      },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

const patchSchema = z.object({
  id:       z.string(),
  status:   z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.string().optional(),
  reply:    z.string().optional(),
  assignedTo: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json() as unknown;
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const { id, status, priority, reply, assignedTo } = parsed.data;

    // Fetch current ticket messages
    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      select: { messages: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let messages: unknown[] = [];
    try { messages = JSON.parse(existing.messages) as unknown[]; } catch { messages = []; }

    if (reply) {
      messages.push({ role: "admin", text: reply, adminEmail: session.user.email, at: new Date().toISOString() });
    }

    const updateData: Record<string, unknown> = { messages: JSON.stringify(messages) };
    if (status     !== undefined) updateData.status     = status;
    if (priority   !== undefined) updateData.priority   = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    await prisma.supportTicket.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
