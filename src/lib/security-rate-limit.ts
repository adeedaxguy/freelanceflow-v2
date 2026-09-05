import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

let tableReady: Promise<unknown> | undefined;
let lastCleanupAt = 0;

export interface SecurityRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function getClientIp(headers: Headers): string {
  const value = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headers.get("x-real-ip")?.trim()
    || "unknown";
  return value.slice(0, 128);
}

function bucketKey(namespace: string, identifier: string): string {
  return createHash("sha256")
    .update(`${namespace}:${identifier.trim().toLowerCase()}`)
    .digest("hex");
}

function ensureTable() {
  tableReady ??= prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SecurityRateLimit" (
    "key" TEXT PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).then(() => prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "SecurityRateLimit_resetAt_idx" ON "SecurityRateLimit"("resetAt")`,
  )).catch(error => {
    tableReady = undefined;
    throw error;
  });
  return tableReady;
}

export async function securityRateLimit(
  namespace: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<SecurityRateLimitResult> {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("Invalid security rate-limit configuration");
  }
  await ensureTable();

  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number; resetAt: Date }>>(`
    INSERT INTO "SecurityRateLimit" ("key", "count", "resetAt", "updatedAt")
    VALUES ($1, 1, $2, $3)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "SecurityRateLimit"."resetAt" <= $3 THEN 1
        ELSE LEAST("SecurityRateLimit"."count" + 1, $4 + 1)
      END,
      "resetAt" = CASE
        WHEN "SecurityRateLimit"."resetAt" <= $3 THEN $2
        ELSE "SecurityRateLimit"."resetAt"
      END,
      "updatedAt" = $3
    RETURNING "count", "resetAt"
  `, bucketKey(namespace, identifier), resetAt, now, limit);

  const bucket = rows[0] ?? { count: limit + 1, resetAt };
  const allowed = bucket.count <= limit;
  const retryAfterSeconds = Math.max(1, Math.ceil((new Date(bucket.resetAt).getTime() - now.getTime()) / 1000));

  if (now.getTime() - lastCleanupAt > 10 * 60 * 1000) {
    lastCleanupAt = now.getTime();
    await prisma.$executeRawUnsafe(
      `DELETE FROM "SecurityRateLimit" WHERE "resetAt" < $1`,
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
    ).catch(() => undefined);
  }

  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds,
  };
}

export function rateLimitHeaders(result: SecurityRateLimitResult): Record<string, string> {
  return {
    "Cache-Control": "no-store",
    "Retry-After": String(result.retryAfterSeconds),
    "X-RateLimit-Remaining": String(result.remaining),
  };
}
