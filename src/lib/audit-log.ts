import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

type AuditLogInput = {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | string | null;
};

const CREATE_AUDIT_LOG_SQL = `CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL,
  "adminEmail" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
let tableReady: Promise<unknown> | undefined;

export async function recordAuditLog(input: AuditLogInput) {
  try {
    const details = typeof input.details === "string"
      ? input.details
      : JSON.stringify(input.details ?? {});
    tableReady ??= prisma.$executeRawUnsafe(CREATE_AUDIT_LOG_SQL)
      .then(() => prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`))
      .catch(error => { tableReady = undefined; throw error; });
    await tableReady;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AuditLog" (id, "adminId", "adminEmail", action, "targetType", "targetId", details, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      `c${randomUUID().replaceAll("-", "")}`,
      input.actorId || "system",
      input.actorEmail || "system",
      input.action,
      input.targetType ?? null,
      input.targetId ?? null,
      details.slice(0, 4000),
    );
  } catch (error) {
    console.error("[audit-log]", error);
  }
}
