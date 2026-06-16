import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name:           z.string().min(1, "Name is required").max(100),
  email:          z.string().email("Invalid email address"),
  password:       z.string().min(8, "Password must be at least 8 characters"),
  expertise:      z.array(z.string()).optional().default([]),
  referralSource: z.string().optional().default(""),
  plan:           z.string().optional().default("free"),
});

function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return "Registration failed. Please try again.";
  const msg = err.message.toLowerCase();
  if (msg.includes("unique") || msg.includes("already exists"))
    return "That email is already registered. Try signing in instead.";
  if (msg.includes("no such column") || msg.includes("disk i/o") || msg.includes("no such table"))
    return "Database not fully set up. Please run: npx prisma db push";
  return "Registration failed. Please try again.";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { name, email, password, expertise, referralSource } = parsed.data;

  // Extract referral code from referralSource if it starts with "ref:"
  const refCode = referralSource?.startsWith("ref:") ? referralSource.slice(4) : null;

  try {
    // Explicit select on findUnique — prevents crash if DB columns are not yet migrated
    const existing = await prisma.user.findUnique({
      where:  { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "That email is already registered. Sign in instead." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:       hashed,
        expertise:      JSON.stringify(expertise),
        referralSource: referralSource || null,
        referredBy:     refCode || null,
        plan:           "free",
        role:           "USER",
      },
      select: { id: true, email: true, name: true },
    });

    // Credit referrer with 300 bonus leads
    if (refCode) {
      await prisma.user.updateMany({
        where: { referralCode: refCode },
        data:  { bonusLeads: { increment: 300 } },
      }).catch(() => {}); // silent fail — referral code may not exist
    }

    return NextResponse.json({ user }, { status: 201 });

  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: friendlyError(err) }, { status: 500 });
  }
}
