export const PLAN_MONTHLY_PRICES = {
  free: 0,
  pro: 10,
  agency: 15,
} as const;

export type PaidPlan = "pro" | "agency";

