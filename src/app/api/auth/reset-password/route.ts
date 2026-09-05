import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1).max(2048),
  password: z.string().min(10, "Password must be at least 10 characters.").max(128),
});
const invalid = { error: "This reset link is invalid or expired. Request a new one." };

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request." }, { status: 400 });
  }

  try {
    const [ipLimit, tokenLimit] = await Promise.all([
      securityRateLimit("reset-password-ip", getClientIp(req.headers), 10, 15 * 60 * 1000),
      securityRateLimit("reset-password-token", parsed.data.token, 5, 15 * 60 * 1000),
    ]);
    if (!ipLimit.allowed || !tokenLimit.allowed) {
      const limited = !ipLimit.allowed ? ipLimit : tokenLimit;
      return NextResponse.json(
        { error: "Too many reset attempts. Request a new link or try again later." },
        { status: 429, headers: rateLimitHeaders(limited) },
      );
    }

    const payload = verifyPasswordResetToken(parsed.data.token);
    if (!payload) return NextResponse.json(invalid, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, updatedAt: true, suspended: true },
    });
    if (!user || user.suspended || user.updatedAt.getTime() !== payload.version) {
      return NextResponse.json(invalid, { status: 400 });
    }

    const password = await bcrypt.hash(parsed.data.password, 12);
    const updated = await prisma.user.updateMany({
      where: { id: user.id, updatedAt: user.updatedAt },
      data: { password, sessionVersion: { increment: 1 } },
    });
    if (updated.count !== 1) return NextResponse.json(invalid, { status: 400 });

    return NextResponse.json({ message: "Password updated. You can now sign in with your email and new password." });
  } catch (error) {
    console.error("[password-reset] Update failed", error);
    return NextResponse.json({ error: "We could not update your password. Please try again." }, { status: 500 });
  }
}
