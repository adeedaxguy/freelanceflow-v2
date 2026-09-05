import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";

const schema = z.object({
  email: z.string().trim().email().max(254).transform(email => email.toLowerCase()),
  plan:  z.enum(["pro", "agency"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const { email, plan } = schema.parse(body);
    const limit = await securityRateLimit("launch-waitlist", getClientIp(req.headers), 5, 24 * 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ ok: false }, { status: 429, headers: rateLimitHeaders(limit) });
    }

    // Store in AdminUser table as a simple waitlist entry using a tag
    // OR fall back to a SiteSettings key — no schema migration needed.
    // We use a raw upsert into a dedicated key in SiteSettings JSON blob.
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "LaunchWaitlist" (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        plan TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, plan)
      )`
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO "LaunchWaitlist" (id, email, plan, "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT DO NOTHING`,
      randomUUID(), email, plan,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT email, plan, "createdAt" FROM "LaunchWaitlist" ORDER BY "createdAt" DESC LIMIT 500`
    ) as { email: string; plan: string; createdAt: string }[];
    return NextResponse.json({ entries: rows, total: rows.length });
  } catch {
    return NextResponse.json({ entries: [], total: 0 });
  }
}
