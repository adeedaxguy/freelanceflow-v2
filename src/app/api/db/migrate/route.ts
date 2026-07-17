import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PostgreSQL-compatible migrations. Safe to run repeatedly.
const TABLE_MIGRATIONS = [
  {
    name: "Template",
    sql: `CREATE TABLE IF NOT EXISTS "Template" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT,
      "name" TEXT NOT NULL,
      "niche" TEXT,
      "subject" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "isDefault" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "ContactSubmission",
    sql: `CREATE TABLE IF NOT EXISTS "ContactSubmission" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "resolved" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: "LeadApplication",
    sql: `CREATE TABLE IF NOT EXISTS "LeadApplication" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "leadUrl" TEXT NOT NULL,
      "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LeadApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  },
  { name: "Template.userId_idx", sql: `CREATE INDEX IF NOT EXISTS "Template_userId_idx" ON "Template"("userId")` },
  { name: "Template.isDefault_idx", sql: `CREATE INDEX IF NOT EXISTS "Template_isDefault_idx" ON "Template"("isDefault")` },
  { name: "ContactSubmission.resolved_idx", sql: `CREATE INDEX IF NOT EXISTS "ContactSubmission_resolved_idx" ON "ContactSubmission"("resolved")` },
  { name: "LeadApplication.userId_leadUrl_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "LeadApplication_userId_leadUrl_key" ON "LeadApplication"("userId", "leadUrl")` },
  { name: "LeadApplication.leadUrl_idx", sql: `CREATE INDEX IF NOT EXISTS "LeadApplication_leadUrl_idx" ON "LeadApplication"("leadUrl")` },
  { name: "LeadApplication.userId_idx", sql: `CREATE INDEX IF NOT EXISTS "LeadApplication_userId_idx" ON "LeadApplication"("userId")` },
];

const MIGRATIONS = [
  { table: "User", name: "suspended",       sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false` },
  { table: "User", name: "plan",            sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free'` },
  { table: "User", name: "role",            sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER'` },
  { table: "User", name: "expertise",       sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS expertise TEXT` },
  { table: "User", name: "referralSource",  sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralSource" TEXT` },
  { table: "User", name: "weeklyLeads",     sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyLeads" INTEGER DEFAULT 0` },
  { table: "User", name: "weeklyLeadReset", sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyLeadReset" TEXT` },
  { table: "User", name: "portfolioLinks",  sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "portfolioLinks" TEXT` },
  { table: "User", name: "avatarUrl",       sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT` },
  { table: "User", name: "bio",             sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT` },
  { table: "User", name: "rate",            sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS rate DOUBLE PRECISION` },
  { table: "User", name: "portfolio",       sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS portfolio TEXT` },
  { table: "User", name: "niche",           sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS niche TEXT` },
  { table: "User", name: "googleId",        sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT` },
  { table: "Lead", name: "phone",           sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS phone TEXT` },
  { table: "Lead", name: "confidence",      sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS confidence INTEGER` },
  { table: "Lead", name: "qualityScore",    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "qualityScore" INTEGER` },
  { table: "Lead", name: "bestMatchScore",  sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "bestMatchScore" INTEGER` },
  { table: "Lead", name: "title",           sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS title TEXT` },
  { table: "Lead", name: "sourceUrl",       sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT` },
  { table: "Lead", name: "source",          sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS source TEXT` },
  { table: "Lead", name: "notes",           sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS notes TEXT` },
  { table: "Lead", name: "isManual",        sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "isManual" BOOLEAN DEFAULT false` },
];

export async function GET() {
  const results: { col: string; status: "added" | "exists" | "error"; detail?: string }[] = [];
  for (const m of TABLE_MIGRATIONS) {
    try {
      await prisma.$executeRawUnsafe(m.sql);
      results.push({ col: m.name, status: "added" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ col: m.name, status: "error", detail: msg });
    }
  }
  for (const m of MIGRATIONS) {
    try {
      await prisma.$executeRawUnsafe(m.sql);
      results.push({ col: `${m.table}.${m.name}`, status: "added" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isDuplicate = msg.includes("already exists") || msg.includes("duplicate column");
      results.push({ col: `${m.table}.${m.name}`, status: isDuplicate ? "exists" : "error", detail: isDuplicate ? undefined : msg });
    }
  }
  const added  = results.filter(r => r.status === "added").length;
  const errors = results.filter(r => r.status === "error");
  return NextResponse.json({
    ok: errors.length === 0,
    added,
    total: results.length,
    message: errors.length === 0
      ? `Migration complete. ${added} column(s) added.`
      : `Finished with ${errors.length} error(s).`,
    results,
  });
}
