export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform(email => email.toLowerCase()),
  message: z.string().trim().min(10).max(2000),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && session.user.role === "ADMIN" ? session : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });

    const limit = await securityRateLimit("contact", getClientIp(req.headers), 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429, headers: rateLimitHeaders(limit) },
      );
    }

    await prisma.contactSubmission.create({ data: parsed.data });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const resolved = req.nextUrl.searchParams.get("resolved");

    const where = resolved !== null ? { resolved: resolved === "true" } : {};
    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 250,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Contact inbox error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id || id.length > 128) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const parsed = z.object({ resolved: z.boolean().optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  try {
    const updated = await prisma.contactSubmission.updateMany({
      where: { id },
      data: { resolved: parsed.data.resolved ?? true },
    });
    if (!updated.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact update error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
