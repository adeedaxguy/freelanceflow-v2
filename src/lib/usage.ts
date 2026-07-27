import { prisma } from "@/lib/prisma";

// Unlimited accounts — bypasses all lead limits
const UNLIMITED_EMAILS = [
  "adeedaxguy@gmail.com",
  "admin@icloseleads.com",
  "adnan@technodigg.com",
  "adnanaimanager@gmail.com",
];

export const PLAN_LIMITS = {
  free:   { leadsPerDay: 100,    proposalsPerMonth: 10,  campaigns: 3 },
  pro:    { leadsPerDay: 999999, proposalsPerMonth: 999, campaigns: 10 },
  agency: { leadsPerDay: 999999, proposalsPerMonth: 999, campaigns: 999 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

function hasShareBonusClaim(value: string | null | undefined): boolean {
  try {
    const claimed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(claimed) && claimed.some(
      entry => typeof entry === "string" && (entry === "share" || entry.startsWith("share:"))
    );
  } catch {
    return false;
  }
}

function getDailyLeadLimit(plan: Plan, bonusLeads = 0): number {
  const baseLimit = PLAN_LIMITS[plan].leadsPerDay;
  if (baseLimit >= 999999) return baseLimit;
  return baseLimit + Math.max(0, bonusLeads);
}

export async function checkAndIncrementLeads(
  userId: string,
  count: number
): Promise<{ allowed: boolean; remaining: number; plan: string; resetAt?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      plan: true,
      weeklyLeads: true,
      weeklyLeadReset: true,
      bonusLeads: true,
      bonusClaimed: true,
    },
  });
  if (!user) return { allowed: false, remaining: 0, plan: "free" };

  // Unlimited bypass
  if (UNLIMITED_EMAILS.includes(user.email ?? "")) {
    return { allowed: true, remaining: 99999, plan: user.plan ?? "agency" };
  }

  const plan = (user.plan as Plan) in PLAN_LIMITS ? (user.plan as Plan) : "free";
  const limit = getDailyLeadLimit(plan, user.bonusLeads ?? 0);

  // Reset counter if 24+ hours have passed
  const now = new Date();
  let resetDate = new Date(user.weeklyLeadReset);
  const hoursSinceReset = (now.getTime() - resetDate.getTime()) / 3_600_000;

  let currentCount = user.weeklyLeads;
  if (hoursSinceReset >= 24) {
    currentCount = 0;
    resetDate = now;
    await prisma.user.update({
      where: { id: userId },
      data: { weeklyLeads: 0, weeklyLeadReset: now },
    });
  }

  const resetAt = new Date(resetDate.getTime() + 24 * 3_600_000).toISOString();
  const remaining = Math.max(0, limit - currentCount);
  if (remaining === 0) return { allowed: false, remaining: 0, plan, resetAt };

  const toAdd = Math.min(count, remaining);
  await prisma.user.update({
    where: { id: userId },
    data: { weeklyLeads: { increment: toAdd } },
  });

  return { allowed: true, remaining: remaining - toAdd, plan, resetAt };
}

export async function getUsageStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, plan: true, weeklyLeads: true, weeklyLeadReset: true, bonusLeads: true, bonusClaimed: true },
  });
  if (!user) return null;

  // Unlimited bypass
  if (UNLIMITED_EMAILS.includes(user.email ?? "")) {
    return {
      plan: user.plan ?? "agency",
      limit: 99999,
      used: 0,
      remaining: 99999,
      nextReset: new Date(Date.now() + 24 * 3_600_000).toISOString(),
      percentage: 0,
      unlimited: true,
      bonusLeads: user.bonusLeads ?? 0,
      shareBonusClaimed: hasShareBonusClaim(user.bonusClaimed),
    };
  }

  const plan = (user.plan as Plan) in PLAN_LIMITS ? (user.plan as Plan) : "free";
  const limit = getDailyLeadLimit(plan, user.bonusLeads ?? 0);
  const now = new Date();
  const resetDate = new Date(user.weeklyLeadReset);
  const hoursSinceReset = (now.getTime() - resetDate.getTime()) / 3_600_000;
  const dailyLeads = hoursSinceReset >= 24 ? 0 : user.weeklyLeads;
  const nextReset = new Date(
    (hoursSinceReset >= 24 ? now : resetDate).getTime() + 24 * 3_600_000,
  );

  const isUnlimited = limit >= 999999;
  return {
    plan,
    limit: isUnlimited ? 99999 : limit,
    used: dailyLeads,
    remaining: isUnlimited ? 99999 : Math.max(0, limit - dailyLeads),
    nextReset: nextReset.toISOString(),
    percentage: isUnlimited ? 0 : Math.round((dailyLeads / limit) * 100),
    unlimited: isUnlimited,
    bonusLeads: user.bonusLeads ?? 0,
    shareBonusClaimed: hasShareBonusClaim(user.bonusClaimed),
  };
}
