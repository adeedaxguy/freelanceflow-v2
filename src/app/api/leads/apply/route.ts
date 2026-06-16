export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST /api/leads/apply ────────────────────────────────────────────────────
// Body: { leadUrl: string }
// Toggles the current user's applied status for a lead URL.
// Returns: { applied: boolean; count: number }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let leadUrl: string;
  try {
    const body = await req.json();
    leadUrl = body.leadUrl?.trim();
    if (!leadUrl) throw new Error("missing leadUrl");
  } catch {
    return NextResponse.json({ error: "leadUrl is required" }, { status: 400 });
  }

  const userId = session.user.id;

  // Check if already applied
  const existing = await prisma.leadApplication.findUnique({
    where: { userId_leadUrl: { userId, leadUrl } },
  });

  if (existing) {
    // Toggle off
    await prisma.leadApplication.delete({
      where: { userId_leadUrl: { userId, leadUrl } },
    });
  } else {
    // Toggle on
    await prisma.leadApplication.create({
      data: { userId, leadUrl },
    });
  }

  // Return new total count for this URL
  const count = await prisma.leadApplication.count({ where: { leadUrl } });

  return NextResponse.json({ applied: !existing, count });
}

// ─── GET /api/leads/apply?urls=url1,url2,url3 ────────────────────────────────
// Returns batch counts + whether the current user applied to each URL.
// Response: { counts: Record<string, number>; applied: Record<string, boolean> }
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const param = req.nextUrl.searchParams.get("urls") ?? "";
  const urls = param
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 200); // cap to avoid massive queries

  if (urls.length === 0) {
    return NextResponse.json({ counts: {}, applied: {} });
  }

  // Batch count per URL
  const rows = await prisma.leadApplication.groupBy({
    by: ["leadUrl"],
    where: { leadUrl: { in: urls } },
    _count: { leadUrl: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.leadUrl] = row._count.leadUrl;
  }

  // Which ones did the current user apply to?
  const applied: Record<string, boolean> = {};
  if (userId) {
    const userRows = await prisma.leadApplication.findMany({
      where: { userId, leadUrl: { in: urls } },
      select: { leadUrl: true },
    });
    for (const r of userRows) {
      applied[r.leadUrl] = true;
    }
  }

  return NextResponse.json({ counts, applied });
}
