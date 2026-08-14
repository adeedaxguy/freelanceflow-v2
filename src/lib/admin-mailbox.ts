import { prisma } from "@/lib/prisma";

let tableReady: Promise<void> | null = null;

export function ensureAdminMailboxTable() {
  tableReady ??= (async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminMailboxMessage" (
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
    )`);
    await Promise.all([
      prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "AdminMailboxMessage_externalId_key" ON "AdminMailboxMessage"("externalId")`),
      prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminMailboxMessage_direction_createdAt_idx" ON "AdminMailboxMessage"("direction", "createdAt")`),
      prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminMailboxMessage_status_idx" ON "AdminMailboxMessage"("status")`),
      prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminMailboxMessage_readAt_idx" ON "AdminMailboxMessage"("readAt")`),
    ]);
  })().catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

export function extractEmailAddress(value: string) {
  return value.match(/<([^<>\s]+@[^<>\s]+)>/)?.[1] ?? value.trim();
}

export function plainTextFromEmail(text: string | null, html: string | null) {
  if (text?.trim()) return text.trim();
  if (!html) return "This message did not include a readable text body.";

  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
