import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BLOG_QUEUE } from "@/data/blog-queue";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Auto-blog publisher — called by Vercel Cron every Monday at 09:00 UTC.
 * Picks the next unpublished post from BLOG_QUEUE and publishes it.
 *
 * Also callable manually:
 *   GET /api/cron/publish-blog?secret=CRON_SECRET
 */
export async function GET(req: NextRequest) {
  // Auth check — Vercel Cron sends the CRON_SECRET automatically via Authorization header.
  // Manual calls pass it as a query param.
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  const isVercelCron = authHeader === `Bearer ${expected}`;
  const isManual = querySecret === expected;

  if (!expected || (!isVercelCron && !isManual)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Find which slugs already exist in the DB
    const existing = await prisma.blogPost.findMany({
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map(p => p.slug));

    // Find the first queued post that hasn't been published yet
    const nextPost = BLOG_QUEUE.find(p => !existingSlugs.has(p.slug));

    if (!nextPost) {
      return NextResponse.json({
        published: false,
        message: "All queued posts have been published. Add more to BLOG_QUEUE.",
        totalPublished: existing.length,
        queueSize: BLOG_QUEUE.length,
      });
    }

    const readTime = Math.max(1, Math.ceil(nextPost.content.split(/\s+/).length / 200));

    const post = await prisma.blogPost.create({
      data: {
        title: nextPost.title,
        slug: nextPost.slug,
        excerpt: nextPost.excerpt,
        content: nextPost.content,
        category: nextPost.category,
        published: true,
        readTime,
      },
    });

    // How many posts remain in the queue
    const remaining = BLOG_QUEUE.filter(p => !existingSlugs.has(p.slug) && p.slug !== nextPost.slug).length;

    console.log(`[CRON] Published blog post: "${post.title}" (slug: ${post.slug}). ${remaining} posts remaining in queue.`);

    return NextResponse.json({
      published: true,
      post: { id: post.id, title: post.title, slug: post.slug },
      remaining,
      message: `Published "${post.title}". ${remaining} posts still queued.`,
    });
  } catch (error) {
    console.error("[CRON] Blog publish failed:", error);
    return NextResponse.json(
      { error: "Failed to publish post", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
