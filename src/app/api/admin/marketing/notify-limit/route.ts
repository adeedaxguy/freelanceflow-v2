export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendAccountNotification } from "@/lib/admin-notifications";
import { FREE_TRIAL_LEAD_LIMIT, getFreeTrialWindow } from "@/lib/plan-limits";
import { prisma } from "@/lib/prisma";

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

  const now = new Date();
  const candidatePool = await prisma.user.findMany({
    where: {
      plan: "free",
      suspended: false,
      OR: [
        { weeklyLeads: { gte: FREE_TRIAL_LEAD_LIMIT } },
        { createdAt: { lte: new Date(now.getTime() - 3 * 86_400_000) } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      weeklyLeads: true,
      bonusLeads: true,
      createdAt: true,
    },
    take: 500,
  });
  const candidates = candidatePool.filter(user =>
    user.weeklyLeads >= FREE_TRIAL_LEAD_LIMIT + user.bonusLeads
    || now >= getFreeTrialWindow(user.createdAt).endsAt
  );

  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: { email: string; error: string }[] = [];

  for (const user of candidates) {
    const trialExpired = now >= getFreeTrialWindow(user.createdAt).endsAt;
    const noticeKey = `free_trial_upgrade_notice:${user.id}`;
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
        subject: trialExpired ? "Your iCloseLeads trial has ended" : "You reached your iCloseLeads trial limit",
        title: `${trialExpired ? "Your 3-day trial has ended" : "You reached your included lead allowance"}${user.name ? `, ${user.name.split(" ")[0]}` : ""}`,
        lines: [
          trialExpired
            ? "Your 3-day iCloseLeads trial has ended. Your saved leads and CRM data remain available."
            : "You have used the lead results included in your 3-day iCloseLeads trial.",
          "Choose Pro or Agency to continue finding new remote and local leads, with secure billing through Stripe.",
          '<a href="https://icloseleads.com/dashboard/upgrade" style="display:inline-block;margin-top:6px;padding:12px 18px;border-radius:9px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;">Choose a paid plan</a>',
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
