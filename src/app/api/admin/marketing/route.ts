import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FREE_BASE_LIMIT = 600;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseClaims(value: string | null): string[] {
  try {
    const parsed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { marketingConsent: true },
        { whatsapp: { not: null } },
        { bonusLeads: { gt: 0 } },
        { referralCode: { not: null } },
        { plan: "free", weeklyLeads: { gte: FREE_BASE_LIMIT } },
      ],
    },
    select: {
      id: true, name: true, email: true, whatsapp: true,
      marketingConsent: true, bonusClaimed: true, bonusLeads: true,
      referralCode: true, referredBy: true, createdAt: true, plan: true,
      weeklyLeads: true, weeklyLeadReset: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const now = Date.now();
  const subscribers = users.map(user => ({
    ...user,
    reachedFreeLimit:
      user.plan === "free"
      && user.weeklyLeads >= FREE_BASE_LIMIT
      && user.bonusLeads === 0,
    atFreeLimit:
      user.plan === "free"
      && user.weeklyLeads >= FREE_BASE_LIMIT
      && user.bonusLeads === 0
      && now - user.weeklyLeadReset.getTime() < DAY_MS,
  }));

  const stats = {
    total:              subscribers.length,
    withWhatsapp:       subscribers.filter(u => u.whatsapp).length,
    withConsent:        subscribers.filter(u => u.marketingConsent).length,
    reachedFreeLimit:   subscribers.filter(u => u.reachedFreeLimit).length,
    atFreeLimit:        subscribers.filter(u => u.atFreeLimit).length,
    claimedShare:       subscribers.filter(u => {
                          const c = parseClaims(u.bonusClaimed);
                          return c.some(entry => entry === "share" || entry.startsWith("share:"));
                        }).length,
    claimedSubscribe:   subscribers.filter(u => {
                          const c = parseClaims(u.bonusClaimed);
                          return c.includes("subscribe");
                        }).length,
    totalBonusLeads:    subscribers.reduce((sum, u) => sum + (u.bonusLeads ?? 0), 0),
  };

  return NextResponse.json({ subscribers, stats });
}
