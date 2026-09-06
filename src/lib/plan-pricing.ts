export const PLAN_MONTHLY_PRICES = {
  free: 0,
  pro: 10,
  agency: 15,
} as const;

export type PaidPlan = "pro" | "agency";

export const PLAN_FEATURES = {
  free: [
    "600 lead results over 3 days, no card required",
    "Local businesses, remote jobs and live opportunities",
    "AI proposal drafts and website concepts",
    "Saved leads and CRM pipeline",
    "Paid phone number and calling-minute add-ons",
  ],
  pro: [
    "1,000 lead results per week",
    "AI proposals and website concepts",
    "Decision-maker research",
    "Up to 2,000 outreach messages per month (150/day)",
    "Saved leads, CSV export and CRM pipeline",
    "Custom templates and follow-up planning",
    "Ad-free dashboard",
    "Paid phone number and calling-minute add-ons",
  ],
  agency: [
    "Everything in Pro",
    "Unlimited lead results, subject to source availability and rate limits",
    "Up to 8,000 outreach messages per month (400/day)",
    "Lead API access: 250 requests per key per day",
    "Additional local business coverage where available",
    "One account; phone numbers and calling minutes billed separately",
  ],
} as const;
