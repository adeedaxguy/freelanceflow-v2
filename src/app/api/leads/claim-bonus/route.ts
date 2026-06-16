import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";
const genCode = () => randomBytes(4).toString("hex").toUpperCase();

const BONUS_PER_ACTION = 300;

const schema = z.object({
  action:    z.enum(["subscribe", "share"]),
  whatsapp:  z.string().optional(),
  source:    z.string().optional(), // "live-jobs" | "remote-leads" | "local-leads"
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { action, whatsapp, source } = parsed.data;
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bonusClaimed: true, bonusLeads: true, referralCode: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse claimed actions
  const claimed: string[] = JSON.parse(user.bonusClaimed ?? "[]") as string[];

  if (claimed.includes(action)) {
    return NextResponse.json({
      alreadyClaimed: true,
      bonusLeads: user.bonusLeads,
      message: `You already claimed the ${action} bonus.`,
    });
  }

  // Generate referral code if not already set
  const referralCode = user.referralCode ?? genCode();

  // Build update data
  const updateData: Record<string, unknown> = {
    bonusLeads:    { increment: BONUS_PER_ACTION },
    bonusClaimed:  JSON.stringify([...claimed, action]),
    referralCode,
  };

  if (action === "subscribe") {
    updateData.marketingConsent = true;
    if (whatsapp?.trim()) updateData.whatsapp = whatsapp.trim();
  }

  if (whatsapp?.trim() && !updateData.whatsapp) {
    updateData.whatsapp = whatsapp.trim();
  }

  await prisma.user.update({ where: { id: userId }, data: updateData });

  const newBonusLeads = (user.bonusLeads ?? 0) + BONUS_PER_ACTION;

  return NextResponse.json({
    success: true,
    bonusLeads: newBonusLeads,
    newLimit: 20 + newBonusLeads, // free plan base + bonus
    referralCode,
    referralUrl: `https://icloseleads.com/auth?mode=signup&ref=${referralCode}`,
    message: `🎉 +${BONUS_PER_ACTION} leads unlocked! Your new weekly limit is ${20 + newBonusLeads}.`,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bonusLeads: true, bonusClaimed: true, referralCode: true, whatsapp: true },
  });

  const claimed: string[] = JSON.parse(user?.bonusClaimed ?? "[]") as string[];

  return NextResponse.json({
    bonusLeads:    user?.bonusLeads ?? 0,
    claimed,
    referralCode:  user?.referralCode,
    whatsapp:      user?.whatsapp,
    canClaimShare:     !claimed.includes("share"),
    canClaimSubscribe: !claimed.includes("subscribe"),
  });
}
