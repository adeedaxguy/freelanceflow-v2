import { prisma } from "@/lib/prisma";
import {
  FREE_TRIAL_LEAD_LIMIT,
  getFreeTrialWindow,
  PRO_WEEKLY_LEAD_LIMIT,
  UNLIMITED_LEAD_LIMIT,
} from "@/lib/plan-limits";

// Unlimited accounts — bypasses all lead limits
const UNLIMITED_EMAILS = [
  "adeedaxguy@gmail.com",
  "admin@icloseleads.com",
  "adnan@technodigg.com",
  "adnanaimanager@gmail.com",
];

export const PLAN_LIMITS = {
  free:   { leadsPerDay: FREE_TRIAL_LEAD_LIMIT,  proposalsPerMonth: 10,  campaigns: 3 },
  pro:    { leadsPerDay: PRO_WEEKLY_LEAD_LIMIT,  proposalsPerMonth: 999, campaigns: 10 },
  agency: { leadsPerDay: UNLIMITED_LEAD_LIMIT,   proposalsPerMonth: 999, campaigns: 999 },
} as const;

const FREE_LEAD_RESET_HOURS = 7 * 24;

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
  if (!Number.isInteger(count) || count <= 0) return { allowed: false, remaining: 0, plan: "free" };

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      plan: true,
      weeklyLeads: true,
      weeklyLeadReset: true,
      bonusLeads: true,
      bonusClaimed: true,
      createdAt: true,
    },
  });
  if (!user) return { allowed: false, remaining: 0, plan: "free" };

  // Unlimited bypass
  if (UNLIMITED_EMAILS.includes(user.email ?? "")) {
    return { allowed: true, remaining: 99999, plan: user.plan ?? "agency" };
  }

  const plan = (user.plan as Plan) in PLAN_LIMITS ? (user.plan as Plan) : "free";
  const limit = getDailyLeadLimit(plan, user.bonusLeads ?? 0);
  const now = new Date();
  let resetDate = new Date(user.weeklyLeadReset);
  let currentCount = user.weeklyLeads;

  if (plan === "free") {
    const trial = getFreeTrialWindow(user.createdAt);
    if (now >= trial.endsAt) {
      return { allowed: false, remaining: 0, plan, resetAt: trial.endsAt.toISOString() };
    }
    if (resetDate < trial.startsAt) {
      await prisma.user.updateMany({
        where: { id: userId, weeklyLeadReset: { lt: trial.startsAt } },
        data: { weeklyLeads: 0, weeklyLeadReset: trial.startsAt },
      });
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          plan: true,
          weeklyLeads: true,
          weeklyLeadReset: true,
          bonusLeads: true,
          bonusClaimed: true,
          createdAt: true,
        },
      });
      if (!user) return { allowed: false, remaining: 0, plan };
      resetDate = new Date(user.weeklyLeadReset);
      currentCount = user.weeklyLeads;
    }
    const remaining = Math.max(0, limit - currentCount);
    if (remaining < count) return { allowed: false, remaining, plan, resetAt: trial.endsAt.toISOString() };

    const reserved = await prisma.user.updateMany({
      where: {
        id: userId,
        weeklyLeadReset: resetDate,
        weeklyLeads: { lte: limit - count },
      },
      data: { weeklyLeads: { increment: count } },
    });
    if (reserved.count !== 1) return { allowed: false, remaining: 0, plan, resetAt: trial.endsAt.toISOString() };
    return { allowed: true, remaining: remaining - count, plan, resetAt: trial.endsAt.toISOString() };
  }

  // Paid-plan lead counters reset weekly.
  const hoursSinceReset = (now.getTime() - resetDate.getTime()) / 3_600_000;

  if (hoursSinceReset >= FREE_LEAD_RESET_HOURS) {
    const cutoff = new Date(now.getTime() - FREE_LEAD_RESET_HOURS * 3_600_000);
    await prisma.user.updateMany({
      where: { id: userId, weeklyLeadReset: { lt: cutoff } },
      data: { weeklyLeads: 0, weeklyLeadReset: now },
    });
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        plan: true,
        weeklyLeads: true,
        weeklyLeadReset: true,
        bonusLeads: true,
        bonusClaimed: true,
        createdAt: true,
      },
    });
    if (!user) return { allowed: false, remaining: 0, plan };
    resetDate = new Date(user.weeklyLeadReset);
    currentCount = user.weeklyLeads;
  }

  const resetAt = new Date(resetDate.getTime() + FREE_LEAD_RESET_HOURS * 3_600_000).toISOString();
  const remaining = Math.max(0, limit - currentCount);
  if (remaining < count) return { allowed: false, remaining, plan, resetAt };

  const reserved = await prisma.user.updateMany({
    where: {
      id: userId,
      weeklyLeadReset: resetDate,
      weeklyLeads: { lte: limit - count },
    },
    data: { weeklyLeads: { increment: count } },
  });
  if (reserved.count !== 1) return { allowed: false, remaining: 0, plan, resetAt };
  return { allowed: true, remaining: remaining - count, plan, resetAt };
}

export async function getUsageStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, plan: true, weeklyLeads: true, weeklyLeadReset: true, bonusLeads: true, bonusClaimed: true, createdAt: true },
  });
  if (!user) return null;

  // Unlimited bypass
  if (UNLIMITED_EMAILS.includes(user.email ?? "")) {
    return {
      plan: user.plan ?? "agency",
      limit: 99999,
      used: 0,
      remaining: 99999,
      nextReset: new Date(Date.now() + FREE_LEAD_RESET_HOURS * 3_600_000).toISOString(),
      percentage: 0,
      unlimited: true,
      bonusLeads: user.bonusLeads ?? 0,
      shareBonusClaimed: hasShareBonusClaim(user.bonusClaimed),
      trialEndsAt: null,
      trialExpired: false,
    };
  }

  const plan = (user.plan as Plan) in PLAN_LIMITS ? (user.plan as Plan) : "free";
  const limit = getDailyLeadLimit(plan, user.bonusLeads ?? 0);
  const now = new Date();
  const resetDate = new Date(user.weeklyLeadReset);

  if (plan === "free") {
    const trial = getFreeTrialWindow(user.createdAt);
    const used = resetDate < trial.startsAt ? 0 : user.weeklyLeads;
    const trialExpired = now >= trial.endsAt;
    return {
      plan,
      limit,
      used,
      remaining: trialExpired ? 0 : Math.max(0, limit - used),
      nextReset: trial.endsAt.toISOString(),
      percentage: trialExpired ? 100 : Math.round((used / limit) * 100),
      unlimited: false,
      bonusLeads: user.bonusLeads ?? 0,
      shareBonusClaimed: hasShareBonusClaim(user.bonusClaimed),
      trialEndsAt: trial.endsAt.toISOString(),
      trialExpired,
    };
  }

  const hoursSinceReset = (now.getTime() - resetDate.getTime()) / 3_600_000;
  const dailyLeads = hoursSinceReset >= FREE_LEAD_RESET_HOURS ? 0 : user.weeklyLeads;
  const nextReset = new Date(
    (hoursSinceReset >= FREE_LEAD_RESET_HOURS ? now : resetDate).getTime() + FREE_LEAD_RESET_HOURS * 3_600_000,
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
    trialEndsAt: null,
    trialExpired: false,
  };
}
