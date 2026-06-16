import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PostgreSQL-compatible migrations using quoted identifiers and $1 placeholders
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
  { table: "Lead", name: "qualityScore",    sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "qualityScore" INTEGER` },
  { table: "Lead", name: "title",           sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS title TEXT` },
  { table: "Lead", name: "sourceUrl",       sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT` },
  { table: "Lead", name: "source",          sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS source TEXT` },
  { table: "Lead", name: "notes",           sql: `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS notes TEXT` },
];

export async function GET(req: NextRequest) {
  // Require a secret token — set MIGRATE_SECRET in Vercel env vars
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.MIGRATE_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: { col: string; status: "added" | "exists" | "error"; detail?: string }[] = [];
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
