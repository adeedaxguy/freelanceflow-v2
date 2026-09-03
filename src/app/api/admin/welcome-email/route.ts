export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { sendWelcomeEmail, WELCOME_EMAIL_KEY_PREFIX } from "@/lib/admin-notifications";
import { prisma } from "@/lib/prisma";

const WINDOW_DAYS = 7;
const BATCH_SIZE = 20;
const RETRY_AFTER_MS = 15 * 60 * 1000;
const requestSchema = z.object({ confirm: z.literal("SEND_RECENT_WELCOMES") });

async function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

function deliveryStatus(value: string): string {
  try {
    return (JSON.parse(value) as { status?: string }).status ?? "sent";
  } catch {
    return "sent";
  }
}

async function getBackfillState() {
  const createdAfter = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { suspended: false, createdAt: { gte: createdAfter } },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const keys = users.map((user) => `${WELCOME_EMAIL_KEY_PREFIX}${user.id}`);
  const deliveries = keys.length
    ? await prisma.platformSetting.findMany({
        where: { key: { in: keys } },
        select: { key: true, value: true, updatedAt: true },
      })
    : [];
  const byKey = new Map(deliveries.map((delivery) => [delivery.key, delivery]));
  const counts = { sent: 0, sending: 0, failed: 0 };
  const pending = users.filter((user) => {
    const delivery = byKey.get(`${WELCOME_EMAIL_KEY_PREFIX}${user.id}`);
    if (!delivery) return true;
    const status = deliveryStatus(delivery.value);
    if (status === "sent") {
      counts.sent += 1;
      return false;
    }
    if (status === "sending" && Date.now() - delivery.updatedAt.getTime() < RETRY_AFTER_MS) {
      counts.sending += 1;
      return false;
    }
    counts.failed += 1;
    return true;
  });

  return { users, pending, counts, createdAfter };
}

export async function GET(req: NextRequest) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const state = await getBackfillState();
  return NextResponse.json({
    windowDays: WINDOW_DAYS,
    createdAfter: state.createdAfter.toISOString(),
    eligible: state.users.length,
    sent: state.counts.sent,
    sending: state.counts.sending,
    failed: state.counts.failed,
    pending: state.pending.length,
    batchSize: BATCH_SIZE,
  });
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Confirmation is required." }, { status: 400 });
  }

  const before = await getBackfillState();
  const batch = before.pending.slice(0, BATCH_SIZE);
  const delivered: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const user of batch) {
    try {
      const result = await sendWelcomeEmail(user);
      if (result.success && !result.skipped) delivered.push(user.id);
    } catch (error) {
      failed.push({
        email: user.email,
        error: error instanceof Error ? error.message : "Welcome email delivery failed",
      });
    }
  }

  const after = await getBackfillState();
  return NextResponse.json({
    success: failed.length === 0,
    windowDays: WINDOW_DAYS,
    eligible: after.users.length,
    delivered: delivered.length,
    failed,
    remaining: after.pending.length,
  });
}
