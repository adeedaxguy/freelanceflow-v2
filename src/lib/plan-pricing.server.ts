import { prisma } from "@/lib/prisma";
import { PLAN_MONTHLY_PRICES, type PaidPlan } from "@/lib/plan-pricing";

const LEGACY_PLAN_PRICES: Record<PaidPlan, string> = {
  pro: "29",
  agency: "79",
};

export async function getConfiguredPlanMonthlyPrice(plan: PaidPlan) {
  const key = `${plan}_price_monthly`;
  const setting = await prisma.platformSetting.findUnique({ where: { key } }).catch(() => null);
  const configured = Number(setting?.value);
  const useCurrentDefault = !Number.isFinite(configured)
    || configured <= 0
    || setting?.value === LEGACY_PLAN_PRICES[plan];

  if (!useCurrentDefault) return configured;

  const value = String(PLAN_MONTHLY_PRICES[plan]);
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  }).catch(() => null);
  return PLAN_MONTHLY_PRICES[plan];
}

