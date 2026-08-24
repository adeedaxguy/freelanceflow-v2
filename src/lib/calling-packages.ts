import { prisma } from "@/lib/prisma";

export type CallingPackage = {
  id: "starter" | "growth" | "scale";
  name: string;
  minutes: number;
  priceCents: number;
  currency: "USD";
};

const BASE_PACKAGES = [
  { id: "starter", name: "Starter calls", minutes: 100 },
  { id: "growth", name: "Growth calls", minutes: 300 },
  { id: "scale", name: "Scale calls", minutes: 1000 },
] as const;

function cents(name: string, fallback: number, max: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 && value <= max ? Math.round(value) : fallback;
}

export function getCallingPackages(): CallingPackage[] {
  const providerCentsPerMinute = cents("TWILIO_CALLING_COST_CENTS_PER_MINUTE", 2, 200);
  const marginCents = cents("TWILIO_CALLING_MARGIN_CENTS", 200, 20_000);
  return BASE_PACKAGES.map(pkg => ({
    ...pkg,
    currency: "USD" as const,
    priceCents: pkg.minutes * providerCentsPerMinute + marginCents,
  }));
}

export function getCallingPackage(id: string) {
  return getCallingPackages().find(pkg => pkg.id === id) || null;
}

export function callingPackagePlan(id: string) {
  return `softphone_minutes_${id}`;
}

export function packageIdFromCallingPlan(plan: string | null | undefined) {
  return plan?.startsWith("softphone_minutes_") ? plan.replace("softphone_minutes_", "") : null;
}

export function isCallingSubscriptionActive(status: string | null | undefined) {
  return ["active", "trialing", "on_trial", "past_due"].includes((status || "").toLowerCase());
}

export async function getCallingMinuteState(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") {
    return { canCall: true, unlimited: true, usedSeconds: 0, remainingSeconds: 1800, package: null };
  }

  const subscriptions = await prisma.billingSubscription.findMany({
    where: {
      userId,
      provider: "STRIPE",
      plan: { startsWith: "softphone_minutes_" },
      testMode: false,
    },
    orderBy: { updatedAt: "desc" },
    select: { plan: true, status: true },
  });
  const subscription = subscriptions.find(item => isCallingSubscriptionActive(item.status));
  const packageId = packageIdFromCallingPlan(subscription?.plan);
  const pkg = packageId ? getCallingPackage(packageId) : null;
  if (!pkg) {
    return { canCall: false, unlimited: false, usedSeconds: 0, remainingSeconds: 0, package: null };
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const calls = await prisma.voiceCall.findMany({
    where: { userId, direction: { in: ["OUTBOUND", "OUTBOUND_AI"] }, createdAt: { gte: monthStart } },
    select: { durationSeconds: true },
  });
  const usedSeconds = calls.reduce((sum, call) => sum + (call.durationSeconds || 0), 0);
  const limitSeconds = pkg.minutes * 60;
  const remainingSeconds = Math.max(0, limitSeconds - usedSeconds);
  return {
    canCall: remainingSeconds > 0,
    unlimited: false,
    usedSeconds,
    remainingSeconds,
    package: pkg,
  };
}
