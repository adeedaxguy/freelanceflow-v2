export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? ""))
    throw new Error("Forbidden");
  return session;
}

function buildDailyData(dates: Date[], days = 30) {
  const counts: Record<string, number> = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    counts[key] = 0;
  }
  for (const date of dates) {
    const key = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const days30 = new Date(now.getTime() - 30 * 86400000);
    const days7  = new Date(now.getTime() - 7  * 86400000);
    const days60 = new Date(now.getTime() - 60 * 86400000);

    const [
      allUsers,
      newUsers30, newUsers7, newUsers30prev,
      totalLeads, newLeads7,
      totalEmails, newEmails7,
      planDist,
      topNiches,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({ where: { createdAt: { gte: days30 } }, select: { createdAt: true } }),
      prisma.user.count({ where: { createdAt: { gte: days7 } } }),
      prisma.user.count({ where: { createdAt: { gte: days60, lt: days30 } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { savedAt: { gte: days7 } } }),
      prisma.sentEmail.count(),
      prisma.sentEmail.count({ where: { sentAt: { gte: days7 } } }),
      (prisma as any).user.groupBy({ by: ["plan"], _count: { _all: true } }) as Promise<Array<{ plan: string; _count: { _all: number } }>>,
      (prisma as any).user.groupBy({ by: ["niche"], _count: { _all: true }, take: 6 }) as Promise<Array<{ niche: string | null; _count: { _all: number } }>>,
      prisma.user.findMany({
        orderBy: { createdAt: "desc" }, take: 5,
        select: { name: true, email: true, plan: true, niche: true, createdAt: true },
      }),
    ]);

    const signupChartData = buildDailyData(newUsers30.map(u => u.createdAt));

    const planMap: Record<string, number> = {};
    for (const p of planDist) planMap[p.plan] = p._count._all;

    const growthPct = newUsers30prev > 0
      ? Math.round(((newUsers30.length - newUsers30prev) / newUsers30prev) * 100)
      : 100;

    return NextResponse.json({
      totalUsers: allUsers,
      newUsers30: newUsers30.length,
      newUsers7,
      growthPct,
      totalLeads, newLeads7,
      totalEmails, newEmails7,
      planDist: planMap,
      signupChartData,
      topNiches: topNiches.map(n => ({ niche: n.niche ?? "unknown", count: n._count._all })),
      recentSignups,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
