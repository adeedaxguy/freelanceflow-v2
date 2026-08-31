export const FREE_TRIAL_DAYS = 3;
export const FREE_TRIAL_LEAD_LIMIT = 600;
export const FREE_SHARE_BONUS_LEADS = 300;
export const PRO_WEEKLY_LEAD_LIMIT = 1000;
export const UNLIMITED_LEAD_LIMIT = 999999;

export type PlanId = "free" | "pro" | "agency";

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  agency: 2,
};

export function isPlanUpgrade(currentPlan: string, nextPlan: string) {
  return (PLAN_RANK[nextPlan as PlanId] ?? -1) > (PLAN_RANK[currentPlan as PlanId] ?? 0);
}

const FREE_TRIAL_ROLLOUT_AT = new Date("2026-08-29T00:00:00.000Z");

export function getFreeTrialWindow(createdAt: Date) {
  const startsAt = new Date(Math.max(createdAt.getTime(), FREE_TRIAL_ROLLOUT_AT.getTime()));
  const endsAt = new Date(startsAt.getTime() + FREE_TRIAL_DAYS * 86_400_000);
  return { startsAt, endsAt };
}
