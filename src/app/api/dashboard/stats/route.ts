import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [leadsFound, emailsSent, openedEmails, emailsOverTime] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.sentEmail.count({ where: { userId } }),
    prisma.sentEmail.count({ where: { userId, status: { in: ["OPENED", "DELIVERED"] } } }),
    prisma.sentEmail.findMany({
      where: { userId, sentAt: { gte: thirtyDaysAgo } },
      select: { sentAt: true },
      orderBy: { sentAt: "asc" },
    }),
  ]);

  // Build daily chart data
  const dailyCounts: Record<string, number> = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyCounts[key] = 0;
  }

  for (const email of emailsOverTime) {
    const key = new Date(email.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in dailyCounts) {
      dailyCounts[key] = (dailyCounts[key] ?? 0) + 1;
    }
  }

  const emailsThisMonth = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  const openRate = emailsSent > 0 ? Math.round((openedEmails / emailsSent) * 100) : 0;
  const responses = await prisma.lead.count({ where: { userId, status: "REPLIED" } });

  return NextResponse.json({ leadsFound, emailsSent, openRate, responses, emailsThisMonth });
}
