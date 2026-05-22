import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const adminView = searchParams.get("admin") === "true";

  if (slug) {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post || (!post.published && !adminView)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  }

  const where = {
    ...(adminView ? {} : { published: true }),
    ...(category && category !== "all" ? { category } : {}),
  };

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, excerpt: true, category: true, published: true, readTime: true, createdAt: true, updatedAt: true, coverImage: true },
  });

  return NextResponse.json({ posts });
}

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  category: z.string().default("General"),
  published: z.boolean().default(false),
  coverImage: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as unknown;
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { id, ...data } = parsed.data;
  const slug = slugify(data.title);
  const readTime = Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200));

  if (id) {
    const post = await prisma.blogPost.update({ where: { id }, data: { ...data, slug, readTime } });
    return NextResponse.json({ post });
  }

  const post = await prisma.blogPost.create({ data: { ...data, slug, readTime } });
  return NextResponse.json({ post }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
