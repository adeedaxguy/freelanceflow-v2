export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_MONTHLY_PRICES } from "@/lib/plan-pricing";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? ""))
    throw new Error("Forbidden");
}

// Pricing tiers (USD/month)
const PLAN_PRICE: Record<string, number> = PLAN_MONTHLY_PRICES;

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const months: Array<{ label: string; start: Date; end: Date }> = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({
        label: start.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        start, end,
      });
    }

    const planDist = await (prisma as any).user.groupBy({
      by: ["plan"],
      _count: { _all: true },
    }) as Array<{ plan: string; _count: { _all: number } }>;

    const planMap: Record<string, number> = {};
    for (const p of planDist) planMap[p.plan] = p._count._all;

    const mrr = Object.entries(planMap).reduce((sum, [plan, count]) => {
      return sum + (PLAN_PRICE[plan] ?? 0) * count;
    }, 0);

    const arr = mrr * 12;

    // Monthly signup data to estimate MRR growth
    const monthlyData = await Promise.all(
      months.map(async (m) => {
        const dist = await (prisma as any).user.groupBy({
          by: ["plan"],
          where: { createdAt: { lte: m.end } },
          _count: { _all: true },
        }) as Array<{ plan: string; _count: { _all: number } }>;
        const revenue = dist.reduce((s: number, p: { plan: string; _count: { _all: number } }) =>
          s + (PLAN_PRICE[p.plan] ?? 0) * p._count._all, 0);
        return { label: m.label, mrr: revenue };
      })
    );

    const totalUsers = Object.values(planMap).reduce((s, n) => s + n, 0);
    const paidUsers  = (planMap.pro ?? 0) + (planMap.agency ?? 0);
    const convRate   = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

    return NextResponse.json({
      mrr, arr, paidUsers, totalUsers, convRate,
      planDist: planMap,
      monthlyData,
      planPrices: PLAN_PRICE,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
