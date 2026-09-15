import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CallingAttempt, CallingCampaign } from "./admin-calling-model";

let ready: Promise<unknown> | undefined;
export function ensureCallingTables() {
  ready ??= (async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminCallingCampaign" (
      "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "data" JSONB NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminCallingAttempt" (
      "id" TEXT PRIMARY KEY, "campaignId" TEXT NOT NULL REFERENCES "AdminCallingCampaign"("id") ON DELETE CASCADE,
      "leadId" TEXT NOT NULL, "phone" TEXT NOT NULL, "data" JSONB NOT NULL,
      "tokenHash" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE ("campaignId", "leadId")
    )`);
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminCallingSuppression" (
      "phone" TEXT PRIMARY KEY, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  })().catch(error => { ready = undefined; throw error; });
  return ready;
}

// One short database lock coordinates the small admin pilot across tabs and servers.
// Never hold it while waiting for a calling or research provider.
export async function callingTransaction<T>(fn: (db: Prisma.TransactionClient) => Promise<T>) {
  await ensureCallingTables();
  return prisma.$transaction(async db => {
    await db.$queryRawUnsafe("SELECT 1 FROM pg_advisory_xact_lock(82150615)");
    return fn(db);
  }, { timeout: 10000 });
}

export async function getCampaign(db: Prisma.TransactionClient, id: string, userId: string) {
  const rows = await db.$queryRawUnsafe<{ data: CallingCampaign }[]>(`SELECT "data" FROM "AdminCallingCampaign" WHERE "id"=$1 AND "userId"=$2`, id, userId);
  if (!rows[0]) throw new Error("Campaign not found.");
  return rows[0].data;
}
export async function saveCampaign(db: Prisma.TransactionClient, campaign: CallingCampaign) {
  await db.$executeRawUnsafe(`UPDATE "AdminCallingCampaign" SET "data"=$2::jsonb WHERE "id"=$1`, campaign.id, JSON.stringify(campaign));
}
export async function saveAttempt(db: Prisma.TransactionClient, attempt: CallingAttempt) {
  await db.$executeRawUnsafe(`UPDATE "AdminCallingAttempt" SET "data"=$2::jsonb WHERE "id"=$1`, attempt.id, JSON.stringify(attempt));
}
export async function insertCampaign(campaign: Omit<CallingCampaign, "id" | "createdAt">) {
  const item: CallingCampaign = { ...campaign, id: randomUUID(), createdAt: new Date().toISOString() };
  await callingTransaction(async db => {
    await db.$executeRawUnsafe(`INSERT INTO "AdminCallingCampaign" ("id","userId","data") VALUES ($1,$2,$3::jsonb)`, item.id, item.userId, JSON.stringify(item));
  });
  return item;
}
export async function callingSnapshot(userId: string) {
  await ensureCallingTables();
  await prisma.$executeRawUnsafe(`UPDATE "AdminCallingAttempt" SET "data"="data" || '{"transcript":[],"summary":"Call notes expired after 30 days.","notesExpired":true}'::jsonb
    WHERE "createdAt" < NOW()-INTERVAL '30 days' AND "data"->>'notesExpired' IS NULL`);
  const campaigns = await prisma.$queryRawUnsafe<{ data: CallingCampaign }[]>(`SELECT "data" FROM "AdminCallingCampaign" WHERE "userId"=$1 ORDER BY "createdAt" DESC LIMIT 50`, userId);
  const attempts = campaigns.length ? await prisma.$queryRawUnsafe<{ data: CallingAttempt }[]>(`SELECT a."data" FROM "AdminCallingAttempt" a JOIN "AdminCallingCampaign" c ON c."id"=a."campaignId" WHERE c."userId"=$1 ORDER BY a."createdAt" DESC LIMIT 750`, userId) : [];
  const suppressed = await prisma.$queryRawUnsafe<{ phone: string }[]>(`SELECT "phone" FROM "AdminCallingSuppression" WHERE "phone"=ANY($1::text[])`, campaigns.flatMap(c => c.data.leads.map(l => l.phone)));
  const phones = new Set(suppressed.map(s => s.phone));
  return { campaigns: campaigns.map(c => ({ ...c.data, leads: c.data.leads.map(l => ({ ...l, suppressed: phones.has(l.phone) })) })), attempts: attempts.map(a => a.data) };
}
