import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const API_SCOPES = [
  "local-businesses:read",
  "remote-jobs:read",
  "live-jobs:read",
] as const;

export type ApiScope = (typeof API_SCOPES)[number];

const DAILY_LIMITS: Record<string, number> = {
  free: 0,
  pro: 0,
  agency: 250,
};

let tableReady: Promise<unknown> | undefined;

export function hashApiKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createApiKey(): { secret: string; hash: string; prefix: string } {
  const secret = `icl_live_${randomBytes(24).toString("base64url")}`;
  return { secret, hash: hashApiKey(secret), prefix: `${secret.slice(0, 17)}...` };
}

export function getApiDailyLimit(plan: string, role: string): number | null {
  return role === "ADMIN" ? null : (DAILY_LIMITS[plan.toLowerCase()] ?? 0);
}

export function readBearerToken(request: NextRequest): string {
  return request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

export function parseScopes(value: string): ApiScope[] {
  try {
    const scopes = JSON.parse(value) as unknown;
    return Array.isArray(scopes)
      ? scopes.filter((scope): scope is ApiScope => API_SCOPES.includes(scope as ApiScope))
      : [];
  } catch {
    return [];
  }
}

export function ensureApiKeyTable() {
  tableReady ??= prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "requestsToday" INTEGER NOT NULL DEFAULT 0,
    "requestDay" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`).then(() => Promise.all([
    prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_keyHash_key" ON "ApiKey"("keyHash")`),
    prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId")`),
    prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ApiKey_revokedAt_idx" ON "ApiKey"("revokedAt")`),
  ])).catch(error => {
    tableReady = undefined;
    throw error;
  });
  return tableReady;
}

type ApiKeyRow = {
  id: string;
  userId: string;
  scopes: string;
  requestsToday: number;
  requestDay: Date;
  plan: string;
  role: string;
  suspended: boolean;
};

export type ApiAuthorization =
  | { ok: true; userId: string; keyId: string; limit: number | null; remaining: number | null; resetAt?: string }
  | { ok: false; status: number; error: string; code: string; limit?: number | null; remaining?: number | null; resetAt?: string };

export async function authorizePublicApi(request: NextRequest, requiredScope: ApiScope): Promise<ApiAuthorization> {
  const supplied = readBearerToken(request);
  if (!supplied.startsWith("icl_live_") || supplied.length < 32) {
    return { ok: false, status: 401, error: "A valid Bearer API key is required.", code: "invalid_api_key" };
  }

  await ensureApiKeyTable();
  const rows = await prisma.$queryRawUnsafe<ApiKeyRow[]>(`
    SELECT k."id", k."userId", k."scopes", k."requestsToday", k."requestDay",
           u."plan", u."role", u."suspended"
    FROM "ApiKey" k
    JOIN "User" u ON u."id" = k."userId"
    WHERE k."keyHash" = $1 AND k."revokedAt" IS NULL
    LIMIT 1
  `, hashApiKey(supplied));
  const key = rows[0];
  if (!key || key.suspended) {
    return { ok: false, status: 401, error: "This API key is invalid or revoked.", code: "invalid_api_key" };
  }
  if (!parseScopes(key.scopes).includes(requiredScope)) {
    return { ok: false, status: 403, error: `This key does not have the ${requiredScope} scope.`, code: "insufficient_scope" };
  }

  const limit = getApiDailyLimit(key.plan, key.role);
  if (limit === 0) {
    return { ok: false, status: 403, error: "Public API access requires an eligible plan.", code: "api_access_required" };
  }

  const now = new Date();
  const requestDay = new Date(key.requestDay);
  const sameUtcDay = now.toISOString().slice(0, 10) === requestDay.toISOString().slice(0, 10);
  if (!sameUtcDay) {
    await prisma.$executeRawUnsafe(
      `UPDATE "ApiKey" SET "requestsToday" = 0, "requestDay" = $2, "updatedAt" = $2 WHERE "id" = $1`,
      key.id, now,
    );
  }

  const updated = limit === null
    ? await prisma.$queryRawUnsafe<Array<{ requestsToday: number }>>(`
        UPDATE "ApiKey"
        SET "requestsToday" = "requestsToday" + 1,
            "totalRequests" = "totalRequests" + 1,
            "lastUsedAt" = $2,
            "updatedAt" = $2
        WHERE "id" = $1
        RETURNING "requestsToday"
      `, key.id, now)
    : await prisma.$queryRawUnsafe<Array<{ requestsToday: number }>>(`
        UPDATE "ApiKey"
        SET "requestsToday" = "requestsToday" + 1,
            "totalRequests" = "totalRequests" + 1,
            "lastUsedAt" = $2,
            "updatedAt" = $2
        WHERE "id" = $1 AND "requestsToday" < $3
        RETURNING "requestsToday"
      `, key.id, now, limit);
  const used = updated[0]?.requestsToday;
  if (!used) {
    const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
    return { ok: false, status: 429, error: "Daily API request limit reached.", code: "rate_limit_exceeded", limit, remaining: 0, resetAt };
  }

  if (limit === null) {
    return { ok: true, userId: key.userId, keyId: key.id, limit: null, remaining: null };
  }

  const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
  return { ok: true, userId: key.userId, keyId: key.id, limit, remaining: Math.max(0, limit - used), resetAt };
}

export const API_SECURITY_HEADERS = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
};
