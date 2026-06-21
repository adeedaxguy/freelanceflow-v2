import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assessBlogComment,
  ensureBlogCommentTables,
  getRequesterIp,
  normalizeCommentEmail,
  stripCommentHtml,
} from "@/lib/blog-comments";
import { STATIC_POSTS } from "@/data/blog-posts";
import { isHiddenBlogSlug } from "@/lib/blog-images";

export const dynamic = "force-dynamic";

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,218}[a-z0-9]$/.test(slug);
}

// GET /api/blog/comments?slug=...
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  if (!isValidSlug(slug)) return NextResponse.json({ error: "invalid slug" }, { status: 400 });

  try {
    await ensureBlogCommentTables();
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
    await ensureBlogCommentTables();
    const body = await req.json();
    const { slug, parentId, authorName, authorEmail, content, honeypot, startedAt } = body;

    // 1. Honeypot — bots fill this hidden field
    const spamAssessment = assessBlogComment({
      name: String(authorName ?? ""),
      email: String(authorEmail ?? ""),
      content: String(content ?? ""),
      honeypot: String(honeypot ?? ""),
      startedAt: Number(startedAt) || undefined,
      userAgent: req.headers.get("user-agent"),
    });
    if (spamAssessment.blocked) return NextResponse.json({ error: "Comment could not be accepted" }, { status: 400 });

    // 2. Required fields
    if (!slug || !authorName || !authorEmail || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!isValidSlug(slug) || isHiddenBlogSlug(slug)) {
      return NextResponse.json({ error: "Invalid post" }, { status: 400 });
    }

    const staticPostExists = STATIC_POSTS.some((post) => post.slug === slug);
    const dbPostExists = staticPostExists
      ? true
      : Boolean(await prisma.blogPost.findFirst({ where: { slug, published: true }, select: { id: true } }));
    if (!dbPostExists) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // 3. Basic email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 4. Sanitize inputs
    const cleanName = stripCommentHtml(authorName).slice(0, 60);
    const cleanEmail = normalizeCommentEmail(authorEmail);
    const cleanContent = stripCommentHtml(content).slice(0, 2000);

    // 5. Length checks
    if (cleanName.length < 2) return NextResponse.json({ error: "Name too short" }, { status: 400 });
    if (cleanContent.length < 10) return NextResponse.json({ error: "Comment too short (min 10 characters)" }, { status: 400 });
    if (cleanContent.length > 2000) return NextResponse.json({ error: "Comment too long (max 2000 characters)" }, { status: 400 });

    // 9. Rate limit by IP — max 5 comments per hour
    const ip = getRequesterIp(req.headers);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.blogCommentRateLimit.count({
      where: { ip, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 3) {
      return NextResponse.json({ error: "Too many comments — please wait a while before posting again" }, { status: 429 });
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyCount = await prisma.blogCommentRateLimit.count({
      where: { ip, createdAt: { gte: dayAgo } },
    });
    if (dailyCount >= 8) {
      return NextResponse.json({ error: "Daily comment limit reached — please try again tomorrow" }, { status: 429 });
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
          authorEmail: cleanEmail,
          content: cleanContent,
          approved: false,
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

    return NextResponse.json({
      comment,
      status: "pending",
      message: "Thanks — your comment is awaiting moderation.",
    }, { status: 201 });
  } catch (err) {
    console.error("Comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
