export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
  } catch {
    return NextResponse.json({ error: "Unable to load users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const parsed = z.object({
      id: z.string().min(1).max(128),
      plan: z.enum(["free", "pro", "agency"]).optional(),
      suspended: z.boolean().optional(),
    }).refine(value => value.plan !== undefined || value.suspended !== undefined).safeParse(
      await req.json().catch(() => null),
    );
    if (!parsed.success) return NextResponse.json({ error: "Invalid user update" }, { status: 400 });
    const { id, plan, suspended } = parsed.data;
    if (id === session.user.id && suspended === true) {
      return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id }, select: { suspended: true } });
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const data: Record<string, unknown> = {};
    if (plan !== undefined)      data.plan      = plan;
    if (suspended !== undefined) {
      data.suspended = suspended;
      if (suspended !== existing.suspended) data.sessionVersion = { increment: 1 };
    }
    await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }
}
