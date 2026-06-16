export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time seed endpoint. Only works if no admin exists yet.
// Protected by a secret token in env or a simple gate.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { secret?: string };
    const expectedSecret = process.env.ADMIN_SEED_SECRET ?? "icloseleads-admin-seed-2024";
    if (body.secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid seed secret" }, { status: 403 });
    }

    // Only run if no admin exists
    const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (existing) {
      return NextResponse.json({ error: "Admin already exists", email: existing.email }, { status: 409 });
    }

    const hashed = await bcrypt.hash("Admin@FF2024!", 12);
    const admin = await prisma.user.create({
      data: {
        email: "admin@icloseleads.com",
        name: "iCloseLeads Admin",
        password: hashed,
        role: "ADMIN",
        plan: "agency",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, admin });
  } catch (e) {
    console.error("Seed error:", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
