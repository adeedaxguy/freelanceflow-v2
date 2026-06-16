export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? ""))
    throw new Error("Forbidden");
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 50;
    const offset = (page - 1) * limit;

    try {
      const logs = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
        limit, offset
      );
      const total = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*) as count FROM "AuditLog"`
      );
      const count = Number(total[0]?.count ?? 0);

      return NextResponse.json({
        logs, total: count,
        page, totalPages: Math.ceil(count / limit),
      });
    } catch {
      // AuditLog table may not exist yet
      return NextResponse.json({ logs: [], total: 0, page, totalPages: 0 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
