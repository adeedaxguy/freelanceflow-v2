import { prisma } from "@/lib/prisma";

let tablesReady = false;

export async function ensureBlogCommentTables() {
  if (tablesReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BlogComment" (
      "id" TEXT NOT NULL,
      "postSlug" TEXT NOT NULL,
      "parentId" TEXT,
      "authorName" TEXT NOT NULL,
      "authorEmail" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "approved" BOOLEAN NOT NULL DEFAULT false,
      "ip" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId")
        REFERENCES "BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogComment_postSlug_idx" ON "BlogComment"("postSlug")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogComment_parentId_idx" ON "BlogComment"("parentId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogComment_approved_idx" ON "BlogComment"("approved")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BlogCommentRateLimit" (
      "id" TEXT NOT NULL,
      "ip" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BlogCommentRateLimit_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogCommentRateLimit_ip_idx" ON "BlogCommentRateLimit"("ip")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BlogCommentRateLimit_createdAt_idx" ON "BlogCommentRateLimit"("createdAt")`);

  tablesReady = true;
}

const SPAM_KEYWORDS = [
  "casino",
  "poker",
  "slots",
  "gambling",
  "viagra",
  "cialis",
  "pharmacy",
  "payday",
  "crypto invest",
  "bitcoin profit",
  "forex trading",
  "make money fast",
  "earn $",
  "work from home opportunity",
  "free followers",
  "instagram followers",
  "tiktok followers",
  "buy cheap",
  "adult",
  "xxx",
  "porn",
];

const DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "yopmail.com",
];

export function stripCommentHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCommentEmail(email: string): string {
  return stripCommentHtml(email).toLowerCase().slice(0, 120);
}

function containsUrl(text: string): boolean {
  return /https?:\/\/|www\.|(?:^|\s)[a-z0-9-]+\.(?:com|net|org|io|xyz|info|top|ru|cn)(?:\s|\/|$)/i.test(text);
}

function countUrls(text: string): number {
  return (text.match(/https?:\/\/|www\.|(?:^|\s)[a-z0-9-]+\.(?:com|net|org|io|xyz|info|top|ru|cn)(?:\s|\/|$)/gi) ?? []).length;
}

function hasRepeatedNoise(text: string): boolean {
  return /(.)\1{7,}/.test(text) || /\b(\w+)(?:\s+\1){4,}\b/i.test(text);
}

export interface CommentSpamAssessment {
  blocked: boolean;
  reasons: string[];
}

export function assessBlogComment(input: {
  name: string;
  email: string;
  content: string;
  honeypot?: string;
  startedAt?: number;
  now?: number;
  userAgent?: string | null;
}): CommentSpamAssessment {
  const reasons: string[] = [];
  const name = stripCommentHtml(input.name);
  const email = normalizeCommentEmail(input.email);
  const content = stripCommentHtml(input.content);
  const lower = `${name} ${email} ${content}`.toLowerCase();
  const now = input.now ?? Date.now();

  if (input.honeypot) reasons.push("honeypot");
  if (input.startedAt && now - input.startedAt < 1200) reasons.push("submitted_too_fast");
  if (!input.userAgent) reasons.push("missing_user_agent");
  if (containsUrl(name)) reasons.push("url_in_name");
  if (countUrls(content) > 1) reasons.push("too_many_links");
  if (SPAM_KEYWORDS.some((kw) => lower.includes(kw))) reasons.push("spam_keyword");
  if (hasRepeatedNoise(content)) reasons.push("repeated_noise");

  const emailDomain = email.split("@")[1] ?? "";
  if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) reasons.push("disposable_email");

  return { blocked: reasons.length > 0, reasons };
}

export function getRequesterIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? headers.get("x-real-ip")
    ?? "unknown";
}
