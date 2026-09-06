import "server-only";
import { prisma } from "@/lib/prisma";

// Exclude the same internal accounts that bypass product limits.
export const CUSTOMER_FILTER = {
  role: "USER",
  suspended: false,
  email: { notIn: ["adeedaxguy@gmail.com", "admin@icloseleads.com", "adnan@technodigg.com", "adnanaimanager@gmail.com"] },
};
export const LIVE_PLAN_FILTER = {
  plan: { in: ["pro", "agency"] },
  testMode: false,
  status: "active",
};

export async function getConversionReport(now = new Date()) {
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const cohort = { ...CUSTOMER_FILTER, createdAt: { gte: since } };
  const [customers, signups, saved, outreach, replied, won, subscribed, complimentary, cohortComplimentary, liveSubscriptions] = await Promise.all([
    prisma.user.count({ where: CUSTOMER_FILTER }),
    prisma.user.count({ where: cohort }),
    prisma.user.count({ where: { ...cohort, leads: { some: {} } } }),
    prisma.user.count({ where: { ...cohort, sentEmails: { some: { status: { in: ["READY_TO_SEND", "SENT", "DELIVERED", "OPENED"] } } } } }),
    prisma.user.count({ where: { ...cohort, leads: { some: { status: { in: ["REPLIED", "NEGOTIATION", "WON"] } } } } }),
    prisma.user.count({ where: { ...cohort, leads: { some: { status: "WON" } } } }),
    prisma.user.count({ where: { ...cohort, billingSubscriptions: { some: LIVE_PLAN_FILTER } } }),
    prisma.user.count({ where: { ...CUSTOMER_FILTER, plan: { in: ["pro", "agency"] }, billingSubscriptions: { none: LIVE_PLAN_FILTER } } }),
    prisma.user.count({ where: { ...cohort, plan: { in: ["pro", "agency"] }, billingSubscriptions: { none: LIVE_PLAN_FILTER } } }),
    prisma.billingSubscription.findMany({
      where: { ...LIVE_PLAN_FILTER, user: CUSTOMER_FILTER },
      select: { userId: true, plan: true, provider: true, externalSubscriptionId: true },
    }),
  ]);
  let events: Array<{ action: string; count: number; users: number }> | null = null;
  try {
    events = await prisma.$queryRaw`
      SELECT a.action, COUNT(*)::int AS count, COUNT(DISTINCT u.id)::int AS users
      FROM "AuditLog" a LEFT JOIN "User" u ON u.id = a."adminId"
      WHERE a."createdAt" >= ${since}
        AND ((u.role = 'USER' AND u.suspended = false
          AND u.email NOT IN ('adeedaxguy@gmail.com','admin@icloseleads.com','adnan@technodigg.com','adnanaimanager@gmail.com'))
          OR (a.action = 'payment_webhook_error' AND a."adminId" = 'system'))
        AND COALESCE(a.details, '') NOT LIKE '%"testMode":true%'
        AND a.action IN ('lead_search_completed','lead_search_empty','lead_search_failed',
          'payment_checkout_started','payment_checkout_completed','payment_checkout_failed',
          'payment_checkout_blocked','payment_failed','payment_webhook_error','payment_checkout_expired','payment_plan_change_started')
      GROUP BY a.action
    `;
  } catch {
    // An unavailable audit table is not evidence of zero checkout attempts.
  }
  return {
    since: since.toISOString(), customers, complimentary, liveSubscriptions,
    cohort: { signups, saved, outreach, replied, won, subscribed, complimentary: cohortComplimentary },
    events,
  };
}
