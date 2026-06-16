export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN")
    throw new Error("Forbidden");
  return session;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, plan: true, suspended: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json() as { id: string; plan?: string; suspended?: boolean };
    const { id, plan, suspended } = body;
    const data: Record<string, unknown> = {};
    if (plan !== undefined)      data.plan      = plan;
    if (suspended !== undefined) data.suspended = suspended;
    await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
