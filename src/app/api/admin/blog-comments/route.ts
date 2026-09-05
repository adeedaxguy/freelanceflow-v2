export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureBlogCommentTables } from "@/lib/blog-comments";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    throw new Error("Forbidden");
  }
  return session;
}

function statusWhere(status: string) {
  if (status === "pending") return { approved: false };
  if (status === "approved") return { approved: true };
  return {};
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await ensureBlogCommentTables();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "pending";
    const query = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(10, Number(searchParams.get("limit") ?? "20")));

    const where = {
      ...statusWhere(status),
      ...(query
        ? {
            OR: [
              { postSlug: { contains: query, mode: "insensitive" as const } },
              { authorName: { contains: query, mode: "insensitive" as const } },
              { authorEmail: { contains: query, mode: "insensitive" as const } },
              { content: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [comments, total, pending, approved] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          postSlug: true,
          parentId: true,
          authorName: true,
          authorEmail: true,
          content: true,
          approved: true,
          ip: true,
          createdAt: true,
          _count: { select: { replies: true } },
        },
      }),
      prisma.blogComment.count({ where }),
      prisma.blogComment.count({ where: { approved: false } }),
      prisma.blogComment.count({ where: { approved: true } }),
    ]);

    return NextResponse.json({
      comments,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts: { pending, approved, all: pending + approved },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load comments" }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  approved: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    await ensureBlogCommentTables();

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const comment = await prisma.blogComment.update({
      where: { id: parsed.data.id },
      data: { approved: parsed.data.approved },
      select: {
        id: true,
        postSlug: true,
        parentId: true,
        authorName: true,
        authorEmail: true,
        content: true,
        approved: true,
        ip: true,
        createdAt: true,
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "Unable to update comment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    await ensureBlogCommentTables();

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.blogComment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete comment" }, { status: 500 });
  }
}
