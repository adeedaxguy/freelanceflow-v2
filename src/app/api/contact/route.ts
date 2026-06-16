export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });

    const submission = await prisma.contactSubmission.create({ data: parsed.data });
    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resolved = searchParams.get("resolved");

  const where = resolved !== null ? { resolved: resolved === "true" } : {};
  const submissions = await prisma.contactSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const body = (await req.json()) as { resolved?: boolean };
  const submission = await prisma.contactSubmission.update({ where: { id }, data: { resolved: body.resolved ?? true } });
  return NextResponse.json({ submission });
}
