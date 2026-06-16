export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name:           z.string().min(2).nullable().optional(),
  niche:          z.string().nullable().optional(),
  bio:            z.string().max(500).nullable().optional(),
  rate:           z.number().min(0).max(10000).nullable().optional(),
  portfolio:      z.string().url().or(z.literal("")).nullable().optional(),
  avatarUrl:      z.string().url().or(z.literal("")).nullable().optional(),
  portfolioLinks: z.string().nullable().optional(), // JSON array of {label,url}
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      niche: true, bio: true, rate: true, portfolio: true,
      avatarUrl: true, portfolioLinks: true, createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as unknown;
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      niche: true, bio: true, rate: true, portfolio: true,
      avatarUrl: true, portfolioLinks: true,
    },
  });

  return NextResponse.json({ user });
}
