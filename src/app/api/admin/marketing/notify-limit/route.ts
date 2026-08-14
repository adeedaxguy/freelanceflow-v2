export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendAccountNotification } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";

const FREE_BASE_LIMIT = 600;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = z.object({ confirm: z.literal("notify-free-limit-users") }).safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }

  const candidates = await prisma.user.findMany({
    where: {
      plan: "free",
      suspended: false,
      weeklyLeads: { gte: FREE_BASE_LIMIT },
      bonusLeads: 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      weeklyLeadReset: true,
    },
    take: 200,
  });

  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: { email: string; error: string }[] = [];

  for (const user of candidates) {
    const noticeKey = `free_limit_notice:${user.id}:${user.weeklyLeadReset.getTime()}`;
    const alreadySent = await prisma.platformSetting.findUnique({
      where: { key: noticeKey },
      select: { id: true },
    });
    if (alreadySent) {
      skipped.push(user.email);
      continue;
    }

    try {
      const result = await sendAccountNotification({
        recipient: user.email,
        subject: "Your 300 extra iCloseLeads leads are ready to unlock",
        title: `You reached the 100-lead free allowance${user.name ? `, ${user.name.split(" ")[0]}` : ""}`,
        lines: [
          "During a recent iCloseLeads search, you used the 100 leads included in your free daily allowance. That allowance refreshes automatically every 24 hours.",
          "You can unlock 300 additional leads across Local Business Leads, Remote Jobs, and Live Jobs by completing the verified share flow.",
          '<a href="https://icloseleads.com/dashboard/local-leads" style="display:inline-block;margin-top:6px;padding:12px 18px;border-radius:9px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;">Unlock 300 leads</a>',
          'Optional product emails are controlled separately in <a href="https://icloseleads.com/dashboard/settings" style="color:#9f67ff;">Settings</a>.',
        ],
      });
      if (!result.success) throw new Error("Account email provider is not configured.");

      await prisma.platformSetting.create({
        data: { key: noticeKey, value: new Date().toISOString() },
      });
      sent.push(user.email);
    } catch (error) {
      failed.push({
        email: user.email,
        error: error instanceof Error ? error.message : "Unknown send failure",
      });
    }
  }

  return NextResponse.json({
    success: failed.length === 0,
    eligible: candidates.length,
    sent: sent.length,
    skipped: skipped.length,
    failed,
  });
}
