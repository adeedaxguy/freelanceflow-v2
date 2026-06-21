import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyNewUserSignup } from "@/lib/admin-notifications";

export const dynamic = 'force-dynamic';

const schema = z.object({
  name:           z.string().min(1, "Name is required").max(100),
  email:          z.string().email("Invalid email address"),
  password:       z.string().min(8, "Password must be at least 8 characters"),
  expertise:      z.array(z.string()).optional().default([]),
  referralSource: z.string().optional().default(""),
  plan:           z.string().optional().default("free"),
});

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
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "That email is already registered. Sign in instead." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 12);

    // Create user via Prisma ORM
    const user = await prisma.user.create({
      data: {
        name:           name.trim(),
        email:          normalizedEmail,
        password:       hashed,
        role:           "USER",
        plan:           "free",
        expertise:      JSON.stringify(expertise),
        referralSource: referralSource || null,
        suspended:      false,
      },
      select: { id: true, email: true, name: true, plan: true },
    });

    try {
      await notifyNewUserSignup({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        expertise,
        referralSource,
      });
    } catch (error) {
      console.error("[register] Admin signup notification failed", error);
    }

    return NextResponse.json({ user }, { status: 201 });

  } catch (err) {
    console.error("[register]", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return NextResponse.json({ error: "That email is already registered. Sign in instead." }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
