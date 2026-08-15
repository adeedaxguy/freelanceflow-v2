export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getPlatformEmailStatus, sendAccountNotification } from "@/lib/admin-notifications";
import {
  FREE_ALLOWANCE_NOTICE_BATCH_SIZE,
  FREE_ALLOWANCE_NOTICE_ID,
  freeAllowanceNoticeContent,
  freeAllowanceNoticeKey,
} from "@/lib/free-allowance-notice";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  confirm: z.literal("SEND_FREE_ALLOWANCE_UPDATE"),
  batchSize: z.number().int().min(1).max(FREE_ALLOWANCE_NOTICE_BATCH_SIZE).default(FREE_ALLOWANCE_NOTICE_BATCH_SIZE),
});

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

async function noticeRecords() {
  const rows = await prisma.platformSetting.findMany({
    where: { key: { startsWith: `account_notice:${FREE_ALLOWANCE_NOTICE_ID}:` } },
    select: { key: true, value: true },
  });
  return rows.map(({ key, value }) => ({
    userId: key.slice(key.lastIndexOf(":") + 1),
    status: (() => {
      try { return JSON.parse(value).status as string; } catch { return "unknown"; }
    })(),
  }));
}

async function noticeStatus() {
  const records = await noticeRecords();
  const deliveredIds = records.filter((record) => record.status === "sent").map((record) => record.userId);
  const failedIds = records.filter((record) => record.status === "failed").map((record) => record.userId);
  const [eligible, delivered, failed] = await Promise.all([
    prisma.user.count({ where: { plan: "free", suspended: false } }),
    prisma.user.count({
      where: {
        plan: "free",
        suspended: false,
        ...(deliveredIds.length ? { id: { in: deliveredIds } } : { id: "__none__" }),
      },
    }),
    prisma.user.count({
      where: {
        plan: "free",
        suspended: false,
        ...(failedIds.length ? { id: { in: failedIds } } : { id: "__none__" }),
      },
    }),
  ]);
  return { eligible, delivered, failed, remaining: Math.max(0, eligible - delivered - failed) };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const [sender, status] = await Promise.all([getPlatformEmailStatus(), noticeStatus()]);
  return NextResponse.json({
    noticeId: FREE_ALLOWANCE_NOTICE_ID,
    sender,
    batchSize: FREE_ALLOWANCE_NOTICE_BATCH_SIZE,
    ...status,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Explicit confirmation and a batch of 1-20 are required." }, { status: 400 });
  }

  const sender = await getPlatformEmailStatus();
  if (!sender.configured) {
    return NextResponse.json({ error: "Account email delivery is not configured." }, { status: 503 });
  }

  const processedIds = (await noticeRecords()).map((record) => record.userId);
  const users = await prisma.user.findMany({
    where: {
      plan: "free",
      suspended: false,
      ...(processedIds.length ? { id: { notIn: processedIds } } : {}),
    },
    select: { id: true, email: true },
    orderBy: { createdAt: "asc" },
    take: Math.min(parsed.data.batchSize * 3, FREE_ALLOWANCE_NOTICE_BATCH_SIZE * 3),
  });

  const notice = freeAllowanceNoticeContent();
  let delivered = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const user of users) {
    if (delivered >= parsed.data.batchSize) break;
    const key = freeAllowanceNoticeKey(user.id);
    try {
      await prisma.platformSetting.create({
        data: { key, value: JSON.stringify({ status: "sending", startedAt: new Date().toISOString() }) },
      });
    } catch {
      skipped += 1;
      continue;
    }

    try {
      if (delivered + failures.length > 0) await wait(650);
      const result = await sendAccountNotification({ recipient: user.email, ...notice });
      if (!result.success) throw new Error("Email delivery became unavailable.");

      await prisma.platformSetting.update({
        where: { key },
        data: {
          value: JSON.stringify({
            status: "sent",
            sentAt: new Date().toISOString(),
            provider: result.provider,
            ...("id" in result && result.id ? { deliveryId: result.id } : {}),
          }),
        },
      });
      await prisma.sentEmail.create({
        data: {
          userId: user.id,
          subject: notice.subject,
          body: notice.lines.join("\n"),
          status: "SENT",
          resendId: "id" in result ? result.id : undefined,
        },
      }).catch(() => undefined);
      delivered += 1;
    } catch (error) {
      await prisma.platformSetting.update({
        where: { key },
        data: { value: JSON.stringify({ status: "failed", failedAt: new Date().toISOString() }) },
      }).catch(() => undefined);
      failures.push(error instanceof Error ? error.message : "Delivery failed");
    }
  }

  const status = await noticeStatus();
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AuditLog" (id, "adminId", "adminEmail", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, 'account_notice_sent', 'User', 'free', $4, NOW())`,
      `c${crypto.randomUUID().replaceAll("-", "")}`,
      session.user.id,
      session.user.email ?? "",
      JSON.stringify({ noticeId: FREE_ALLOWANCE_NOTICE_ID, delivered, skipped, failed: failures.length }),
    );
  } catch {
    // The account notice remains valid if the optional audit table is unavailable.
  }

  return NextResponse.json({
    success: failures.length === 0,
    attempted: users.length,
    delivered,
    skipped,
    failed: failures.length,
    remaining: status.remaining,
    sender: sender.fromEmail,
  });
}
