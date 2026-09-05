export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";

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
  } catch {
    return NextResponse.json({ error: "Unable to load support tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const parsed = z.object({
      email: z.string().trim().email().max(254).transform(email => email.toLowerCase()),
      subject: z.string().trim().min(3).max(160),
      message: z.string().trim().min(10).max(5000),
      category: z.string().trim().max(60).optional(),
    }).safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid support request" }, { status: 400 });

    const limit = await securityRateLimit(
      "support-ticket",
      session?.user?.id ?? getClientIp(req.headers),
      5,
      60 * 60 * 1000,
    );
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many support requests. Please try again later." }, {
        status: 429,
        headers: rateLimitHeaders(limit),
      });
    }
    const body = parsed.data;

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
        category: body.category ?? null,
      },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create support ticket" }, { status: 500 });
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
  } catch {
    return NextResponse.json({ error: "Unable to update support ticket" }, { status: 500 });
  }
}
