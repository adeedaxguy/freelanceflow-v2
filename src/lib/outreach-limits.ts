import { prisma } from "@/lib/prisma";

export const OUTREACH_PREPARED_STATUS = "READY_TO_SEND";
export const OUTREACH_LOGGED_STATUSES = [
  "SENT",
  "DELIVERED",
  "OPENED",
  "BOUNCED",
  "FAILED",
  OUTREACH_PREPARED_STATUS,
];

export interface OutreachPlanLimit {
  daily: number;
  monthly: number;
  perMinute: number;
  label: string;
}

export interface OutreachUsage extends OutreachPlanLimit {
  plan: string;
  usedToday: number;
  usedThisMonth: number;
  usedThisMinute: number;
  remainingToday: number;
  remainingThisMonth: number;
  nextDailyReset: string;
  nextMonthlyReset: string;
}

const LIMITS = {
  free:   { daily: 50,  monthly: 400,  perMinute: 5,  label: "Free" },
  pro:    { daily: 150, monthly: 2000, perMinute: 8,  label: "Pro" },
  agency: { daily: 400, monthly: 8000, perMinute: 10, label: "Agency" },
} satisfies Record<string, OutreachPlanLimit>;

export type OutreachPlanKey = keyof typeof LIMITS;

const UNLIMITED_OUTREACH_EMAILS = new Set([
  "adeedaxguy@gmail.com",
  "adnan@technodigg.com",
  "adnanaimanager@gmail.com",
]);

function isOutreachPlanKey(plan: string): plan is OutreachPlanKey {
  return plan in LIMITS;
}

export function normalizeOutreachPlan(plan?: string | null): OutreachPlanKey {
  const key = (plan ?? "free").toLowerCase();
  return isOutreachPlanKey(key) ? key : "free";
}

export function hasUnlimitedOutreach(email?: string | null): boolean {
  return UNLIMITED_OUTREACH_EMAILS.has((email ?? "").toLowerCase());
}

export function getOutreachLimit(plan?: string | null): OutreachPlanLimit {
  return LIMITS[normalizeOutreachPlan(plan)];
}

export async function resolveOutreachPlan(params: {
  userId: string;
  sessionPlan?: string | null;
  sessionEmail?: string | null;
}): Promise<OutreachPlanKey> {
  if (hasUnlimitedOutreach(params.sessionEmail)) return "agency";

  const sessionPlan = normalizeOutreachPlan(params.sessionPlan);
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, plan: true },
    });
    if (hasUnlimitedOutreach(user?.email)) return "agency";
    if (user?.plan) return normalizeOutreachPlan(user.plan);
  } catch {
    // Fall back to the session value if the database is temporarily unavailable.
  }

  return sessionPlan;
}

function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function startOfUtcMonth(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfUtcMinute(now: Date): Date {
  return new Date(Math.floor(now.getTime() / 60_000) * 60_000);
}

function nextUtcDay(now: Date): Date {
  const d = startOfUtcDay(now);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function nextUtcMonth(now: Date): Date {
  const d = startOfUtcMonth(now);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

export async function getOutreachUsage(userId: string, plan?: string | null, now = new Date()): Promise<OutreachUsage> {
  const planKey = normalizeOutreachPlan(plan);
  const limit = getOutreachLimit(plan);
  const [usedToday, usedThisMonth, usedThisMinute] = await Promise.all([
    prisma.sentEmail.count({
      where: {
        userId,
        status: { in: OUTREACH_LOGGED_STATUSES },
        sentAt: { gte: startOfUtcDay(now) },
      },
    }),
    prisma.sentEmail.count({
      where: {
        userId,
        status: { in: OUTREACH_LOGGED_STATUSES },
        sentAt: { gte: startOfUtcMonth(now) },
      },
    }),
    prisma.sentEmail.count({
      where: {
        userId,
        status: { in: OUTREACH_LOGGED_STATUSES },
        sentAt: { gte: startOfUtcMinute(now) },
      },
    }),
  ]);

  return {
    ...limit,
    plan: planKey,
    usedToday,
    usedThisMonth,
    usedThisMinute,
    remainingToday: Math.max(0, limit.daily - usedToday),
    remainingThisMonth: Math.max(0, limit.monthly - usedThisMonth),
    nextDailyReset: nextUtcDay(now).toISOString(),
    nextMonthlyReset: nextUtcMonth(now).toISOString(),
  };
}

export async function getResolvedOutreachUsage(params: {
  userId: string;
  sessionPlan?: string | null;
  sessionEmail?: string | null;
  now?: Date;
}): Promise<OutreachUsage> {
  const plan = await resolveOutreachPlan(params);
  return getOutreachUsage(params.userId, plan, params.now ?? new Date());
}

export function outreachLimitError(usage: OutreachUsage): string | null {
  if (usage.usedThisMinute >= usage.perMinute) {
    return `Slow down a little. You can prepare or send ${usage.perMinute} outreach emails per minute.`;
  }
  if (usage.usedToday >= usage.daily) {
    return `Daily outreach limit reached. Your ${usage.label} plan renews at ${usage.nextDailyReset.slice(11, 16)} UTC.`;
  }
  if (usage.usedThisMonth >= usage.monthly) {
    return `Monthly outreach limit reached. Your ${usage.label} plan renews on ${new Date(usage.nextMonthlyReset).toLocaleDateString()}.`;
  }
  return null;
}

export function gmailComposeUrl(params: { to: string; subject: string; body: string }): string {
  const search = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: params.to,
    su: params.subject,
    body: params.body,
  });
  return `https://mail.google.com/mail/?${search.toString()}`;
}

export function mailtoUrl(params: { to: string; subject: string; body: string }): string {
  const search = new URLSearchParams({
    subject: params.subject,
    body: params.body,
  });
  return `mailto:${encodeURIComponent(params.to)}?${search.toString()}`;
}
