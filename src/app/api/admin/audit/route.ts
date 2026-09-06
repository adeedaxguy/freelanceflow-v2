export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? ""))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const requestedPage = Number(searchParams.get("page") ?? 1);
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = 50;
    const offset = (page - 1) * limit;

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
    return NextResponse.json({ error: "Audit history is unavailable. Please retry." }, { status: 503 });
  }
}
