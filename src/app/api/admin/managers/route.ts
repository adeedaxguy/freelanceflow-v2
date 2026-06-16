export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN")
    throw new Error("Forbidden — only ADMIN can manage staff");
  return session;
}

function cuid() {
  return "c" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
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
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json() as { id: string; role: "USER" | "MANAGER" | "ADMIN" };
    const { id, role } = body;

    if (!["USER", "MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    // Prevent demoting yourself
    if (id === session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { role } });

    // Audit log (non-fatal — AuditLog table may not exist)
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AuditLog" (id, "adminId", "adminEmail", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, 'role_change', 'User', $4, $5, NOW())`,
        cuid(), session.user.id, session.user.email ?? "", id, JSON.stringify({ newRole: role })
      );
    } catch { /* non-fatal */ }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
