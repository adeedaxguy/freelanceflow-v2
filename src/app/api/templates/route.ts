export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.template.findMany({
    where: { OR: [{ userId: session.user.id }, { isDefault: true }] },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ templates });
}

const templateSchema = z.object({
  name: z.string().min(1),
  niche: z.string().optional(),
  subject: z.string().min(1),
  body: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as unknown;
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const template = await prisma.template.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ template }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.template.deleteMany({
    where: { id, userId: session.user.id, isDefault: false },
  });

  return NextResponse.json({ success: true });
}
