import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

const postSchema = z.object({
  title:    z.string().trim().min(1).max(200),
  content:  z.string().min(1).max(250_000),
  excerpt:  z.string().max(500).optional(),
  category: z.string().trim().min(1).max(80).default("General"),
  published: z.boolean().default(true),
});

function validSecret(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.BLOG_AUTO_SECRET?.trim() ?? "";
  const auth = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
  if (secret.length < 32 || !auth || !validSecret(auth, secret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as unknown;
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
