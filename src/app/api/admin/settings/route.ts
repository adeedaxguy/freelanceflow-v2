export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

// GET all platform settings
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const settings = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
    // Mask sensitive values before sending
    const masked = settings.map(s => ({
      key: s.key,
      value: isSensitiveKey(s.key) && s.value.length > 8
        ? s.value.slice(0, 4) + "••••••••" + s.value.slice(-4)
        : s.value,
      rawLength: s.value.length,
      isSet: s.value.length > 0,
    }));
    return NextResponse.json({ settings: masked });
  } catch (err) {
    console.error("GET settings error:", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// PATCH — update one or many settings
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const schema = z.object({
    updates: z.record(z.string(), z.string()),
  });

  try {
    const body: unknown = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const { updates } = parsed.data;

    // Upsert each setting
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return NextResponse.json({ success: true, updated: Object.keys(updates).length });
  } catch (err) {
    console.error("PATCH settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

function isSensitiveKey(key: string): boolean {
  return ["stripe_secret_key", "stripe_webhook_secret", "groq_api_key", "resend_api_key"].includes(key);
}
