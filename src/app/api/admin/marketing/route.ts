import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      ],
    },
    select: {
      id: true, name: true, email: true, whatsapp: true,
      marketingConsent: true, bonusClaimed: true, bonusLeads: true,
      referralCode: true, referredBy: true, createdAt: true, plan: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const stats = {
    total:              users.length,
    withWhatsapp:       users.filter(u => u.whatsapp).length,
    withConsent:        users.filter(u => u.marketingConsent).length,
    claimedShare:       users.filter(u => {
                          const c = JSON.parse(u.bonusClaimed ?? "[]") as string[];
                          return c.some(entry => entry === "share" || entry.startsWith("share:"));
                        }).length,
    claimedSubscribe:   users.filter(u => {
                          const c = JSON.parse(u.bonusClaimed ?? "[]") as string[];
                          return c.includes("subscribe");
                        }).length,
    totalBonusLeads:    users.reduce((sum, u) => sum + (u.bonusLeads ?? 0), 0),
  };

  return NextResponse.json({ subscribers: users, stats });
}
