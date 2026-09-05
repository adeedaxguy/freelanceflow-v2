export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN")
    throw new Error("Forbidden — only ADMIN can manage staff");
  return session;
}

export async function GET() {
  try {
    await requireAdmin();
    const managers = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "MANAGER"] } },
      select: {
        id: true, name: true, email: true, role: true, plan: true,
        suspended: true, createdAt: true,
        _count: { select: { leads: true, sentEmails: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ managers });
  } catch {
    return NextResponse.json({ error: "Unable to load managers" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = z.object({
      id: z.string().min(1).max(128),
      role: z.enum(["USER", "MANAGER", "ADMIN"]),
    }).safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid role change" }, { status: 400 });
    const { id, role } = parsed.data;
    // Prevent demoting yourself
    if (id === session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { role, sessionVersion: { increment: 1 } } });

    // Audit log (non-fatal — AuditLog table may not exist)
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AuditLog" (id, "adminId", "adminEmail", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, 'role_change', 'User', $4, $5, NOW())`,
        `c${crypto.randomUUID().replaceAll("-", "")}`, session.user.id, session.user.email ?? "", id, JSON.stringify({ newRole: role })
      );
    } catch { /* non-fatal */ }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to update manager" }, { status: 500 });
  }
}
