import { prisma } from "@/lib/prisma";

export const PLAN_LIMITS = {
  free:   { leadsPerWeek: 20,  proposalsPerMonth: 10,  campaigns: 1 },
  pro:    { leadsPerWeek: 500, proposalsPerMonth: 999, campaigns: 10 },
  agency: { leadsPerWeek: 999, proposalsPerMonth: 999, campaigns: 999 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export async function checkAndIncrementLeads(
  userId: string,
  count: number
): Promise<{ allowed: boolean; remaining: number; plan: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, weeklyLeads: true, weeklyLeadReset: true },
  });
  if (!user) return { allowed: false, remaining: 0, plan: "free" };

  const plan = (user.plan as Plan) in PLAN_LIMITS ? (user.plan as Plan) : "free";
  const limit = PLAN_LIMITS[plan].leadsPerWeek;

  // Reset weekly counter if 7+ days have passed
  const now = new Date();
  const resetDate = new Date(user.weeklyLeadReset);
  const daysSinceReset = (now.getTime() - resetDate.getTime()) / 86_400_000;

  let currentCount = user.weeklyLeads;
  if (daysSinceReset >= 7) {
    currentCount = 0;
    await prisma.user.update({
      where: { id: userId },
      data: { weeklyLeads: 0, weeklyLeadReset: now },
    });
  }

  const remaining = Math.max(0, limit - currentCount);
  if (remaining === 0) return { allowed: false, remaining: 0, plan };

  const toAdd = Math.min(count, remaining);
  await prisma.user.update({
    where: { id: userId },
    data: { weeklyLeads: { increment: toAdd } },
  });

  return { allowed: true, remaining: remaining - toAdd, plan };
}

export async function getUsageStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, weeklyLeads: true, weeklyLeadReset: true },
  });
  if (!user) return null;

  const plan = (user.plan as Plan) in PLAN_LIMITS ? (user.plan as Plan) : "free";
  const limit = PLAN_LIMITS[plan].leadsPerWeek;
  const now = new Date();
  const resetDate = new Date(user.weeklyLeadReset);
  const daysSinceReset = (now.getTime() - resetDate.getTime()) / 86_400_000;
  const weeklyLeads = daysSinceReset >= 7 ? 0 : user.weeklyLeads;
  const nextReset = new Date(resetDate.getTime() + 7 * 86_400_000);

  return {
    plan,
    limit,
    used: weeklyLeads,
    remaining: Math.max(0, limit - weeklyLeads),
    nextReset: nextReset.toISOString(),
    percentage: Math.round((weeklyLeads / limit) * 100),
  };
}
