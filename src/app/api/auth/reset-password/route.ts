import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1).max(2048),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});
const invalid = { error: "This reset link is invalid or expired. Request a new one." };

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request." }, { status: 400 });
  }

  try {
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
      data: { password },
    });
    if (updated.count !== 1) return NextResponse.json(invalid, { status: 400 });

    return NextResponse.json({ message: "Password updated. You can now sign in with your email and new password." });
  } catch (error) {
    console.error("[password-reset] Update failed", error);
    return NextResponse.json({ error: "We could not update your password. Please try again." }, { status: 500 });
  }
}
