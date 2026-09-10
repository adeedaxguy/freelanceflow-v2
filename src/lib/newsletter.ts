import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/marketing-email";

export type NewsletterTopic = "updates" | "status";
type Subscriber = { id: string; email: string; topic: NewsletterTopic };
let tableReady: Promise<unknown> | undefined;

function ensureTable() {
  tableReady ??= prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
    "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "topic" TEXT NOT NULL,
    "tokenHash" TEXT, "expiresAt" TIMESTAMP(3), "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("email", "topic")
  )`).catch(error => { tableReady = undefined; throw error; });
  return tableReady;
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function requestNewsletterConfirmation(email: string, topic: NewsletterTopic) {
  await ensureTable();
  const token = randomBytes(32).toString("hex");
  // A repeated signup must never deactivate an already confirmed subscription.
  const rows = await prisma.$queryRawUnsafe<Subscriber[]>(`
    INSERT INTO "NewsletterSubscription" ("id", "email", "topic", "tokenHash", "expiresAt")
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT ("email", "topic") DO UPDATE SET "tokenHash" = $4, "expiresAt" = $5
    WHERE "NewsletterSubscription"."confirmedAt" IS NULL OR "NewsletterSubscription"."unsubscribedAt" IS NOT NULL
    RETURNING "id", "email", "topic"
  `, randomUUID(), email.trim().toLowerCase(), topic, hash(token), new Date(Date.now() + 86_400_000));
  return rows[0] ? { ...rows[0], token } : null;
}

export async function confirmNewsletter(token: string): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(`
    UPDATE "NewsletterSubscription" SET "confirmedAt" = CURRENT_TIMESTAMP, "unsubscribedAt" = NULL,
      "tokenHash" = NULL, "expiresAt" = NULL
    WHERE "tokenHash" = $1 AND "expiresAt" > CURRENT_TIMESTAMP RETURNING "id"
  `, hash(token));
  return rows.length === 1;
}

export function newsletterUnsubscribeUrl(subscriber: Subscriber) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error("Newsletter signing is not configured.");
  return `https://icloseleads.com/api/newsletter/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(subscriber.id, subscriber.email))}`;
}

export async function unsubscribeNewsletter(token: string): Promise<boolean> {
  if (token.length > 200) return false;
  const id = token.slice(0, token.lastIndexOf("."));
  if (!id) return false;
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe<Subscriber[]>(`SELECT "id", "email", "topic" FROM "NewsletterSubscription" WHERE "id" = $1`, id);
  if (!rows[0] || verifyUnsubscribeToken(token, rows[0].email) !== id) return false;
  await prisma.$executeRawUnsafe(`UPDATE "NewsletterSubscription" SET "unsubscribedAt" = CURRENT_TIMESTAMP,
    "tokenHash" = NULL, "expiresAt" = NULL WHERE "id" = $1`, id);
  return true;
}

export async function newsletterRecipients(topic: NewsletterTopic, limit: number) {
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe<Subscriber[]>(`
    SELECT "id", "email", "topic" FROM "NewsletterSubscription"
    WHERE "topic" = $1 AND "confirmedAt" IS NOT NULL AND "unsubscribedAt" IS NULL
    ORDER BY "createdAt" ASC LIMIT $2
  `, topic, limit);
  return rows.map(row => ({ ...row, name: null }));
}

export async function newsletterCount(topic: NewsletterTopic) {
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*) AS count FROM "NewsletterSubscription"
    WHERE "topic" = $1 AND "confirmedAt" IS NOT NULL AND "unsubscribedAt" IS NULL`, topic);
  return Number(rows[0]?.count ?? 0);
}
