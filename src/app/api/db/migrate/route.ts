import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PostgreSQL-compatible migrations. Safe to run repeatedly.
const TABLE_MIGRATIONS = [
  {
    name: "ApiKey",
    sql: `CREATE TABLE IF NOT EXISTS "ApiKey" (
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
    )`,
  },
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
  {
    name: "BillingSubscription",
    sql: `CREATE TABLE IF NOT EXISTS "BillingSubscription" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "provider" TEXT NOT NULL DEFAULT 'LEMONSQUEEZY',
      "externalSubscriptionId" TEXT NOT NULL,
      "externalCustomerId" TEXT,
      "externalOrderId" TEXT,
      "plan" TEXT NOT NULL,
      "variantId" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "testMode" BOOLEAN NOT NULL DEFAULT false,
      "renewsAt" TIMESTAMP(3),
      "endsAt" TIMESTAMP(3),
      "trialEndsAt" TIMESTAMP(3),
      "cardBrand" TEXT,
      "cardLastFour" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BillingSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  },
  {
    name: "TelephonyWorkspace",
    sql: `CREATE TABLE IF NOT EXISTS "TelephonyWorkspace" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "twilioAccountSid" TEXT,
      "twilioAuthTokenEncrypted" TEXT,
      "twilioApiKeySid" TEXT,
      "twilioApiKeySecretEncrypted" TEXT,
      "twimlAppSid" TEXT,
      "phoneNumberSid" TEXT,
      "phoneNumber" TEXT,
      "phoneCountry" TEXT,
      "monthlyPriceCents" INTEGER,
      "priceCurrency" TEXT,
      "consentAcceptedAt" TIMESTAMP(3),
      "lastError" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TelephonyWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  },
  {
    name: "VoiceCall",
    sql: `CREATE TABLE IF NOT EXISTS "VoiceCall" (
      "id" TEXT PRIMARY KEY,
      "workspaceId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "leadId" TEXT,
      "twilioCallSid" TEXT,
      "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
      "from" TEXT NOT NULL,
      "to" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'QUEUED',
      "durationSeconds" INTEGER,
      "costCents" INTEGER,
      "costCurrency" TEXT,
      "outcome" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "answeredAt" TIMESTAMP(3),
      "endedAt" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "VoiceCall_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TelephonyWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "VoiceCall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "VoiceCall_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
  },
  {
    name: "TelephonyPurchase",
    sql: `CREATE TABLE IF NOT EXISTS "TelephonyPurchase" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "workspaceId" TEXT NOT NULL,
      "phoneNumberSid" TEXT,
      "phoneNumber" TEXT NOT NULL,
      "country" TEXT NOT NULL,
      "monthlyPriceCents" INTEGER NOT NULL,
      "currency" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'CHECKOUT_PENDING',
      "variantId" TEXT NOT NULL,
      "externalSubscriptionId" TEXT,
      "externalCustomerId" TEXT,
      "externalOrderId" TEXT,
      "subscriptionStatus" TEXT,
      "testMode" BOOLEAN NOT NULL DEFAULT false,
      "consentAcceptedAt" TIMESTAMP(3) NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "renewsAt" TIMESTAMP(3),
      "endsAt" TIMESTAMP(3),
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "lastError" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TelephonyPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "TelephonyPurchase_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "TelephonyWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  },
  {
    name: "TelephonyPurchase.phoneNumberSid",
    sql: `ALTER TABLE "TelephonyPurchase" ADD COLUMN IF NOT EXISTS "phoneNumberSid" TEXT`,
  },
  {
    name: "AdminMailboxMessage",
    sql: `CREATE TABLE IF NOT EXISTS "AdminMailboxMessage" (
      "id" TEXT PRIMARY KEY,
      "externalId" TEXT,
      "messageId" TEXT,
      "direction" TEXT NOT NULL,
      "fromEmail" TEXT NOT NULL,
      "toEmail" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'RECEIVED',
      "readAt" TIMESTAMP(3),
      "replyToId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  { name: "Template.userId_idx", sql: `CREATE INDEX IF NOT EXISTS "Template_userId_idx" ON "Template"("userId")` },
  { name: "Template.isDefault_idx", sql: `CREATE INDEX IF NOT EXISTS "Template_isDefault_idx" ON "Template"("isDefault")` },
  { name: "ContactSubmission.resolved_idx", sql: `CREATE INDEX IF NOT EXISTS "ContactSubmission_resolved_idx" ON "ContactSubmission"("resolved")` },
  { name: "LeadApplication.userId_leadUrl_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "LeadApplication_userId_leadUrl_key" ON "LeadApplication"("userId", "leadUrl")` },
  { name: "LeadApplication.leadUrl_idx", sql: `CREATE INDEX IF NOT EXISTS "LeadApplication_leadUrl_idx" ON "LeadApplication"("leadUrl")` },
  { name: "LeadApplication.userId_idx", sql: `CREATE INDEX IF NOT EXISTS "LeadApplication_userId_idx" ON "LeadApplication"("userId")` },
  { name: "BillingSubscription.externalSubscriptionId_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "BillingSubscription_externalSubscriptionId_key" ON "BillingSubscription"("externalSubscriptionId")` },
  { name: "BillingSubscription.userId_idx", sql: `CREATE INDEX IF NOT EXISTS "BillingSubscription_userId_idx" ON "BillingSubscription"("userId")` },
  { name: "BillingSubscription.status_idx", sql: `CREATE INDEX IF NOT EXISTS "BillingSubscription_status_idx" ON "BillingSubscription"("status")` },
  { name: "BillingSubscription.externalCustomerId_idx", sql: `CREATE INDEX IF NOT EXISTS "BillingSubscription_externalCustomerId_idx" ON "BillingSubscription"("externalCustomerId")` },
  { name: "TelephonyWorkspace.userId_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "TelephonyWorkspace_userId_key" ON "TelephonyWorkspace"("userId")` },
  { name: "TelephonyWorkspace.twilioAccountSid_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "TelephonyWorkspace_twilioAccountSid_key" ON "TelephonyWorkspace"("twilioAccountSid")` },
  { name: "TelephonyWorkspace.status_idx", sql: `CREATE INDEX IF NOT EXISTS "TelephonyWorkspace_status_idx" ON "TelephonyWorkspace"("status")` },
  { name: "TelephonyWorkspace.phoneNumber_idx", sql: `CREATE INDEX IF NOT EXISTS "TelephonyWorkspace_phoneNumber_idx" ON "TelephonyWorkspace"("phoneNumber")` },
  { name: "VoiceCall.twilioCallSid_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "VoiceCall_twilioCallSid_key" ON "VoiceCall"("twilioCallSid")` },
  { name: "VoiceCall.workspaceId_idx", sql: `CREATE INDEX IF NOT EXISTS "VoiceCall_workspaceId_idx" ON "VoiceCall"("workspaceId")` },
  { name: "VoiceCall.userId_createdAt_idx", sql: `CREATE INDEX IF NOT EXISTS "VoiceCall_userId_createdAt_idx" ON "VoiceCall"("userId", "createdAt")` },
  { name: "VoiceCall.leadId_idx", sql: `CREATE INDEX IF NOT EXISTS "VoiceCall_leadId_idx" ON "VoiceCall"("leadId")` },
  { name: "VoiceCall.status_idx", sql: `CREATE INDEX IF NOT EXISTS "VoiceCall_status_idx" ON "VoiceCall"("status")` },
  { name: "TelephonyPurchase.externalSubscriptionId_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "TelephonyPurchase_externalSubscriptionId_key" ON "TelephonyPurchase"("externalSubscriptionId")` },
  { name: "TelephonyPurchase.phoneNumberSid_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "TelephonyPurchase_phoneNumberSid_key" ON "TelephonyPurchase"("phoneNumberSid")` },
  { name: "TelephonyPurchase.userId_status_idx", sql: `CREATE INDEX IF NOT EXISTS "TelephonyPurchase_userId_status_idx" ON "TelephonyPurchase"("userId", "status")` },
  { name: "TelephonyPurchase.workspaceId_idx", sql: `CREATE INDEX IF NOT EXISTS "TelephonyPurchase_workspaceId_idx" ON "TelephonyPurchase"("workspaceId")` },
  { name: "AdminMailboxMessage.externalId_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "AdminMailboxMessage_externalId_key" ON "AdminMailboxMessage"("externalId")` },
  { name: "AdminMailboxMessage.direction_createdAt_idx", sql: `CREATE INDEX IF NOT EXISTS "AdminMailboxMessage_direction_createdAt_idx" ON "AdminMailboxMessage"("direction", "createdAt")` },
  { name: "AdminMailboxMessage.status_idx", sql: `CREATE INDEX IF NOT EXISTS "AdminMailboxMessage_status_idx" ON "AdminMailboxMessage"("status")` },
  { name: "AdminMailboxMessage.readAt_idx", sql: `CREATE INDEX IF NOT EXISTS "AdminMailboxMessage_readAt_idx" ON "AdminMailboxMessage"("readAt")` },
  { name: "ApiKey.keyHash_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_keyHash_key" ON "ApiKey"("keyHash")` },
  { name: "ApiKey.userId_idx", sql: `CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId")` },
  { name: "ApiKey.revokedAt_idx", sql: `CREATE INDEX IF NOT EXISTS "ApiKey_revokedAt_idx" ON "ApiKey"("revokedAt")` },
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

export async function GET(req: NextRequest) {
  const secret = process.env.MIGRATE_SECRET;
  const supplied = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("secret");
  const session = await getServerSession(authOptions);
  const hasSecret = Boolean(secret && supplied === secret);
  const isAdmin = session?.user?.role === "ADMIN";
  if (!hasSecret && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
