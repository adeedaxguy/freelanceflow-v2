import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  plan:  z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const { email, plan } = schema.parse(body);

    // Store in AdminUser table as a simple waitlist entry using a tag
    // OR fall back to a SiteSettings key — no schema migration needed.
    // We use a raw upsert into a dedicated key in SiteSettings JSON blob.
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "LaunchWaitlist" (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
        email TEXT NOT NULL,
        plan TEXT NOT NULL,
        "createdAt" TEXT NOT NULL
      )`
    ).catch(() => {}); // PostgreSQL: table may already exist

    await prisma.$executeRawUnsafe(
      `INSERT INTO "LaunchWaitlist" (id, email, plan, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, now()::text)
       ON CONFLICT DO NOTHING`,
      email.toLowerCase(),
      plan
    ).catch(async () => {
      // Fallback: try without gen_random_uuid (SQLite dev)
      await prisma.$executeRawUnsafe(
        `INSERT OR IGNORE INTO "LaunchWaitlist" (id, email, plan, "createdAt")
         VALUES (lower(hex(randomblob(8))), ?, ?, datetime('now'))`,
        email.toLowerCase(),
        plan
      );
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  // Admin-only: list waitlist entries
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.NEXTAUTH_SECRET) {
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
