export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalLeads, totalEmails, activeCampaigns, recentUsers, recentEmails] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.sentEmail.count(),
    prisma.campaign.count({ where: { status: "RUNNING" } }),
    prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.sentEmail.findMany({ where: { sentAt: { gte: thirtyDaysAgo } }, select: { sentAt: true } }),
  ]);

  function buildDailyData(dates: Date[]) {
    const counts: Record<string, number> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      counts[key] = 0;
    }
    for (const date of dates) {
      const key = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }

  return NextResponse.json({
    totalUsers,
    totalLeads,
    totalEmails,
    activeCampaigns,
    signupsOverTime: buildDailyData(recentUsers.map((u) => u.createdAt)),
    emailsOverTime: buildDailyData(recentEmails.map((e) => e.sentAt)),
  });
}
