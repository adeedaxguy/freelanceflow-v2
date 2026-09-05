import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyNewUserSignup } from "@/lib/admin-notifications";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";

export const dynamic = 'force-dynamic';

const schema = z.object({
  name:           z.string().trim().min(1, "Name is required").max(100),
  email:          z.string().trim().email("Invalid email address").max(254),
  password:       z.string().min(10, "Password must be at least 10 characters").max(128),
  expertise:      z.array(z.string().trim().max(80)).max(20).optional().default([]),
  referralSource: z.string().trim().max(160).optional().default(""),
  marketingConsent: z.boolean().optional().default(false),
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

  const { name, email, password, expertise, referralSource, marketingConsent } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const ip = getClientIp(req.headers);
    const [ipLimit, accountLimit] = await Promise.all([
      securityRateLimit("register-ip", ip, 5, 60 * 60 * 1000),
      securityRateLimit("register-account", normalizedEmail, 3, 24 * 60 * 60 * 1000),
    ]);
    if (!ipLimit.allowed || !accountLimit.allowed) {
      const limited = !ipLimit.allowed ? ipLimit : accountLimit;
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(limited) },
      );
    }

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
        name,
        email:          normalizedEmail,
        password:       hashed,
        role:           "USER",
        plan:           "free",
        expertise:      JSON.stringify(expertise),
        referralSource: referralSource || null,
        marketingConsent,
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
