export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug      = searchParams.get("slug");
  const category  = searchParams.get("category");
  const adminView = searchParams.get("admin") === "true";
  const id        = searchParams.get("id");

  if (id) {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  }

  if (slug) {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post || (!post.published && !adminView)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  }

  const where = adminView ? {} : { published: true };
  const categoryFilter = category && category !== "all" ? { category } : {};
  const posts = await prisma.blogPost.findMany({
    where: { ...where, ...categoryFilter },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, excerpt: true, category: true,
      published: true, readTime: true, author: true,
      coverImage: true, ogImage: true, tags: true,
      focusKeyword: true, metaTitle: true, metaDesc: true,
      createdAt: true, updatedAt: true,
    },
  });
  return NextResponse.json({ posts });
}

const postSchema = z.object({
  id:           z.string().optional(),
  title:        z.string().min(1).max(200),
  content:      z.string().min(1),
  excerpt:      z.string().max(300).optional().default(""),
  category:     z.string().default("General"),
  published:    z.boolean().default(false),
  coverImage:   z.string().optional().default(""),
  author:       z.string().optional().default("iCloseLeads Team"),
  tags:         z.string().optional().default(""),
  metaTitle:    z.string().max(70).optional().default(""),
  metaDesc:     z.string().max(165).optional().default(""),
  focusKeyword: z.string().max(80).optional().default(""),
  ogImage:      z.string().optional().default(""),
  canonical:    z.string().optional().default(""),
  noIndex:      z.boolean().optional().default(false),
  twitterCard:  z.string().optional().default("summary_large_image"),
  schema:       z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN","MANAGER"].includes(session.user.role ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as unknown;
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  const { id, ...data } = parsed.data;
  const slug     = slugify(data.title);
  const readTime = Math.max(1, Math.ceil(data.content.replace(/<[^>]*>/g,"").split(/\s+/).length / 200));

  if (id) {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title, slug, content: data.content, excerpt: data.excerpt,
        category: data.category, published: data.published,
        coverImage: data.coverImage, author: data.author, tags: data.tags,
        readTime, metaTitle: data.metaTitle, metaDesc: data.metaDesc,
        focusKeyword: data.focusKeyword, ogImage: data.ogImage,
        canonical: data.canonical, noIndex: data.noIndex,
        twitterCard: data.twitterCard, schema: data.schema,
      },
    });
    return NextResponse.json({ post });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: data.title, slug, content: data.content, excerpt: data.excerpt,
      category: data.category, published: data.published,
      coverImage: data.coverImage, author: data.author, tags: data.tags,
      readTime, metaTitle: data.metaTitle, metaDesc: data.metaDesc,
      focusKeyword: data.focusKeyword, ogImage: data.ogImage,
      canonical: data.canonical, noIndex: data.noIndex,
      twitterCard: data.twitterCard, schema: data.schema,
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN","MANAGER"].includes(session.user.role ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
