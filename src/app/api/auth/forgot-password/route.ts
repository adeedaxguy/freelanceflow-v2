import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPlatformEmail } from "@/lib/admin-notifications";
import { createPasswordResetToken, renderPasswordResetEmail } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { getClientIp, securityRateLimit } from "@/lib/security-rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(254) });
const response = { message: "If an account exists for that email, a reset link is on its way." };
const THROTTLE_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  try {
    const [ipLimit, accountLimit] = await Promise.all([
      securityRateLimit("forgot-password-ip", getClientIp(req.headers), 10, 15 * 60 * 1000),
      securityRateLimit("forgot-password-account", email, 3, 60 * 60 * 1000),
    ]);
    if (!ipLimit.allowed || !accountLimit.allowed) return NextResponse.json(response);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, updatedAt: true, suspended: true },
    });
    if (!user || user.suspended) return NextResponse.json(response);

    const key = `password_reset_rate_${user.id}`;
    const recent = await prisma.platformSetting.findUnique({ where: { key } });
    if (recent && Date.now() - recent.updatedAt.getTime() < THROTTLE_MS) return NextResponse.json(response);

    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value: new Date().toISOString() },
      update: { value: new Date().toISOString() },
    });

    const token = createPasswordResetToken(user);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://icloseleads.com").replace(/\/$/, "");
    const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const emailContent = renderPasswordResetEmail(resetUrl);
    const delivery = await sendPlatformEmail({
      recipient: user.email,
      ...emailContent,
      idempotencyKey: `password-reset-${user.id}-${Math.floor(Date.now() / THROTTLE_MS)}`,
    });
    if (!delivery.success) console.error("[password-reset] Email delivery is not configured.");
  } catch (error) {
    console.error("[password-reset] Request failed", error);
  }

  return NextResponse.json(response);
}
