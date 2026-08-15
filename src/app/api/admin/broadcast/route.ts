export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  CAMPAIGN_DUPLICATE_WINDOW_MS,
  campaignContentHash,
  hasRecentMatchingCampaign,
} from "@/lib/campaign-delivery";
import { getPlatformEmailStatus, sendPlatformEmail } from "@/lib/admin-notifications";
import { renderMarketingEmail } from "@/lib/marketing-email";
import { prisma } from "@/lib/prisma";

const MAX_BATCH_SIZE = 200;
const segmentSchema = z.enum(["all", "free", "pro", "agency"]);
const campaignSchema = z.object({
  campaignId: z.string().uuid(),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(20).max(10_000),
  segment: segmentSchema,
  confirm: z.literal("SEND_CONSENTED_CAMPAIGN"),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

function recipientWhere(segment: z.infer<typeof segmentSchema>) {
  return {
    suspended: false,
    marketingConsent: true,
    ...(segment === "all" ? {} : { plan: segment }),
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const [sender, all, free, pro, agency, totalAll, totalFree, totalPro, totalAgency] = await Promise.all([
    getPlatformEmailStatus(),
    prisma.user.count({ where: recipientWhere("all") }),
    prisma.user.count({ where: recipientWhere("free") }),
    prisma.user.count({ where: recipientWhere("pro") }),
    prisma.user.count({ where: recipientWhere("agency") }),
    prisma.user.count({ where: { suspended: false } }),
    prisma.user.count({ where: { suspended: false, plan: "free" } }),
    prisma.user.count({ where: { suspended: false, plan: "pro" } }),
    prisma.user.count({ where: { suspended: false, plan: "agency" } }),
  ]);

  return NextResponse.json({
    sender,
    counts: { all, free, pro, agency },
    totals: { all: totalAll, free: totalFree, pro: totalPro, agency: totalAgency },
    maxBatchSize: MAX_BATCH_SIZE,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = campaignSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid campaign." }, { status: 400 });
  }

  const sender = await getPlatformEmailStatus();
  if (!sender.configured) {
    return NextResponse.json({
      error: "Email delivery is not configured. Verify hello@icloseleads.com in Resend and add its API credentials before sending.",
    }, { status: 503 });
  }

  const { campaignId, subject, message, segment } = parsed.data;
  const deliveryKey = `marketing_broadcast_${campaignId}`;
  const contentHash = campaignContentHash(subject, message);
  const contentLockKey = `marketing_broadcast_content_${new Date().toISOString().slice(0, 10)}_${contentHash}`;
  const startedAt = new Date().toISOString();

  const recentCampaigns = await prisma.platformSetting.findMany({
    where: {
      key: { startsWith: "marketing_broadcast_" },
      updatedAt: { gte: new Date(Date.now() - CAMPAIGN_DUPLICATE_WINDOW_MS) },
    },
    select: { value: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 250,
  });

  if (hasRecentMatchingCampaign(recentCampaigns, subject, message)) {
    return NextResponse.json({
      error: "This campaign was already sent within the last 24 hours. Duplicate delivery was blocked.",
    }, { status: 409 });
  }

  try {
    const initialState = JSON.stringify({ status: "sending", subject, segment, contentHash, delivered: [], startedAt });
    await prisma.$transaction([
      prisma.platformSetting.create({ data: { key: deliveryKey, value: initialState } }),
      prisma.platformSetting.create({ data: { key: contentLockKey, value: initialState } }),
    ]);
  } catch {
    return NextResponse.json({ error: "This campaign was already started. Duplicate delivery was blocked." }, { status: 409 });
  }

  const users = await prisma.user.findMany({
    where: recipientWhere(segment),
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
    take: MAX_BATCH_SIZE,
  });

  const delivered: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const user of users) {
    try {
      const rendered = renderMarketingEmail({
        userId: user.id,
        name: user.name,
        email: user.email,
        subject,
        message,
      });
      const delivery = await sendPlatformEmail({
        recipient: user.email,
        subject: subject.replaceAll("{name}", user.name?.trim().split(/\s+/)[0] || "there"),
        html: rendered.html,
        text: rendered.text,
        headers: {
          "List-Unsubscribe": `<${rendered.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      if (!delivery.success) throw new Error("Email delivery became unavailable.");
      delivered.push(user.id);
      const progress = JSON.stringify({ status: "sending", subject, segment, contentHash, delivered, startedAt });
      await prisma.$transaction([
        prisma.platformSetting.update({ where: { key: deliveryKey }, data: { value: progress } }),
        prisma.platformSetting.update({ where: { key: contentLockKey }, data: { value: progress } }),
      ]);
    } catch (error) {
      failed.push({ email: user.email, error: error instanceof Error ? error.message : "Delivery failed" });
    }
  }

  const eligibleCount = await prisma.user.count({ where: recipientWhere(segment) });
  const skipped = Math.max(0, eligibleCount - users.length);
  const completedAt = new Date().toISOString();
  const completedState = JSON.stringify({
    status: "completed",
    subject,
    segment,
    contentHash,
    delivered,
    failed: failed.length,
    skipped,
    startedBy: session.user.email,
    completedAt,
  });
  await prisma.$transaction([
    prisma.platformSetting.update({ where: { key: deliveryKey }, data: { value: completedState } }),
    prisma.platformSetting.update({ where: { key: contentLockKey }, data: { value: completedState } }),
  ]);

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AuditLog" (id, "adminId", "adminEmail", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, 'broadcast_sent', 'User', 'consented', $4, NOW())`,
      `c${crypto.randomUUID().replaceAll("-", "")}`,
      session.user.id,
      session.user.email ?? "",
      JSON.stringify({ campaignId, subject, segment, delivered: delivered.length, failed: failed.length, skipped }),
    );
  } catch {
    // Delivery must not be reported as failed only because an optional audit table is unavailable.
  }

  return NextResponse.json({
    success: failed.length === 0,
    delivered: delivered.length,
    failed: failed.length,
    skipped,
    segment,
    sender: sender.fromEmail,
  });
}
