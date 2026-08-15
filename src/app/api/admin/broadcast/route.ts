export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
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

  const [sender, all, free, pro, agency] = await Promise.all([
    getPlatformEmailStatus(),
    prisma.user.count({ where: recipientWhere("all") }),
    prisma.user.count({ where: recipientWhere("free") }),
    prisma.user.count({ where: recipientWhere("pro") }),
    prisma.user.count({ where: recipientWhere("agency") }),
  ]);

  return NextResponse.json({ sender, counts: { all, free, pro, agency }, maxBatchSize: MAX_BATCH_SIZE });
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
  const startedAt = new Date().toISOString();
  try {
    await prisma.platformSetting.create({
      data: {
        key: deliveryKey,
        value: JSON.stringify({ status: "sending", subject, segment, delivered: [], startedAt }),
      },
    });
  } catch {
    return NextResponse.json({ error: "This reviewed campaign was already started. Create a new preview before sending again." }, { status: 409 });
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
      await prisma.platformSetting.update({
        where: { key: deliveryKey },
        data: { value: JSON.stringify({ status: "sending", subject, segment, delivered, startedAt }) },
      });
    } catch (error) {
      failed.push({ email: user.email, error: error instanceof Error ? error.message : "Delivery failed" });
    }
  }

  const eligibleCount = await prisma.user.count({ where: recipientWhere(segment) });
  const skipped = Math.max(0, eligibleCount - users.length);
  const completedAt = new Date().toISOString();
  await prisma.platformSetting.update({
    where: { key: deliveryKey },
    data: {
      value: JSON.stringify({
        status: "completed",
        subject,
        segment,
        delivered,
        failed: failed.length,
        skipped,
        startedBy: session.user.email,
        completedAt,
      }),
    },
  });

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
