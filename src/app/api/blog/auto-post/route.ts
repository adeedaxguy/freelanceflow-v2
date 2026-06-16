import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const SECRET = process.env.BLOG_AUTO_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

const postSchema = z.object({
  title:    z.string().min(1),
  content:  z.string().min(1),
  excerpt:  z.string().optional(),
  category: z.string().default("General"),
  published: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-auto-secret");
  if (!SECRET || auth !== SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as unknown;
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const data = parsed.data;
  const slug = slugify(data.title);
  const readTime = Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200));

  // Avoid duplicate slugs
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const post = await prisma.blogPost.create({
    data: { ...data, slug: finalSlug, readTime },
  });

  return NextResponse.json({ post }, { status: 201 });
}
