import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BlogComment" (
      "id" TEXT NOT NULL,
      "postSlug" TEXT NOT NULL,
      "parentId" TEXT,
      "authorName" TEXT NOT NULL,
      "authorEmail" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "approved" BOOLEAN NOT NULL DEFAULT true,
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
}

let tablesReady = false;
async function getTablesReady() {
  if (tablesReady) return;
  await ensureTables();
  tablesReady = true;
}

// Spam keyword list — common patterns in blog comment spam
const SPAM_KEYWORDS = [
  "casino", "poker", "slots", "gambling", "viagra", "cialis", "pharmacy",
  "loan", "payday", "crypto invest", "bitcoin profit", "forex trading",
  "make money fast", "earn $", "work from home opportunity", "click here",
  "buy cheap", "free followers", "instagram followers", "tiktok followers",
  "seo services", "backlinks", "adult", "xxx", "porn",
];

function containsSpam(text: string): boolean {
  const lower = text.toLowerCase();
  return SPAM_KEYWORDS.some((kw) => lower.includes(kw));
}

function containsUrl(text: string): boolean {
  return /https?:\/\/|www\.|\.com\/|\.net\/|\.io\//.test(text);
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

// GET /api/blog/comments?slug=...
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  try {
    await getTablesReady();
    const comments = await prisma.blogComment.findMany({
      where: { postSlug: slug, approved: true, parentId: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, authorName: true, content: true, createdAt: true,
        replies: {
          where: { approved: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, authorName: true, content: true, createdAt: true },
        },
      },
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

// POST /api/blog/comments
export async function POST(req: NextRequest) {
  try {
    await getTablesReady();
    const body = await req.json();
    const { slug, parentId, authorName, authorEmail, content, honeypot } = body;

    // 1. Honeypot — bots fill this hidden field
    if (honeypot) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    // 2. Required fields
    if (!slug || !authorName || !authorEmail || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 3. Basic email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 4. Sanitize inputs
    const cleanName = stripHtml(authorName).slice(0, 60);
    const cleanContent = stripHtml(content).slice(0, 2000);

    // 5. Length checks
    if (cleanName.length < 2) return NextResponse.json({ error: "Name too short" }, { status: 400 });
    if (cleanContent.length < 10) return NextResponse.json({ error: "Comment too short (min 10 characters)" }, { status: 400 });
    if (cleanContent.length > 2000) return NextResponse.json({ error: "Comment too long (max 2000 characters)" }, { status: 400 });

    // 6. URL in name = likely spam
    if (containsUrl(cleanName)) {
      return NextResponse.json({ error: "Please enter your name, not a URL" }, { status: 400 });
    }

    // 7. Spam keyword check
    if (containsSpam(cleanName) || containsSpam(cleanContent)) {
      return NextResponse.json({ error: "Comment flagged as spam" }, { status: 400 });
    }

    // 8. Excessive URLs in content = likely spam
    const urlMatches = (cleanContent.match(/https?:\/\/|www\./gi) ?? []).length;
    if (urlMatches > 2) {
      return NextResponse.json({ error: "Too many links in comment" }, { status: 400 });
    }

    // 9. Rate limit by IP — max 5 comments per hour
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.blogCommentRateLimit.count({
      where: { ip, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 5) {
      return NextResponse.json({ error: "Too many comments — please wait a while before posting again" }, { status: 429 });
    }

    // 10. Duplicate detection — same content on same post in last 10 min
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await prisma.blogComment.findFirst({
      where: { postSlug: slug, content: cleanContent, createdAt: { gte: tenMinAgo } },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Duplicate comment detected" }, { status: 400 });
    }

    // 11. Validate parentId if replying
    if (parentId) {
      const parent = await prisma.blogComment.findFirst({
        where: { id: parentId, postSlug: slug, approved: true },
      });
      if (!parent) return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }

    // Create comment + rate limit entry in parallel
    const [comment] = await Promise.all([
      prisma.blogComment.create({
        data: {
          postSlug: slug,
          parentId: parentId ?? null,
          authorName: cleanName,
          authorEmail,
          content: cleanContent,
          approved: true,
          ip,
        },
        select: { id: true, authorName: true, content: true, createdAt: true },
      }),
      prisma.blogCommentRateLimit.create({ data: { ip } }),
    ]);

    // Clean up old rate limit entries (older than 2 hours) — best effort
    prisma.blogCommentRateLimit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
    }).catch(() => {});

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("Comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
