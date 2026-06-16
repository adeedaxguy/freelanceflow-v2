import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
const genCode = () => randomBytes(4).toString("hex").toUpperCase();

const BONUS_BY_SOURCE: Record<string, number> = {
  "local-leads": 300,
  "live-jobs": 100,
  "remote-leads": 100,
};
const DEFAULT_BONUS = 100;
const FREE_LOCAL_BASE_LIMIT = 100;

const schema = z.object({
  action:             z.enum(["subscribe", "share"]),
  whatsapp:           z.string().optional(),
  source:             z.string().optional(), // "live-jobs" | "remote-leads" | "local-leads"
  openedPlatforms:    z.array(z.enum(["linkedin", "facebook"])).optional(),
  linkedinProfileUrl: z.string().url().optional(),
  facebookProfileUrl: z.string().url().optional(),
});

function parseClaimed(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function isLinkedInProof(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    return host === "linkedin.com" && (/^\/in\/[^/]+\/?$/i.test(url.pathname) || /^\/posts\//i.test(url.pathname) || /^\/feed\/update\//i.test(url.pathname));
  } catch {
    return false;
  }
}

function isFacebookProof(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "");
    if (host !== "facebook.com" && host !== "fb.com") return false;
    if (!path || path === "/sharer" || path === "/dialog/share") return false;
    return /^\/[A-Za-z0-9.]+/.test(path) || /^\/profile\.php$/i.test(path) || /^\/share\//i.test(path) || /^\/permalink\.php$/i.test(path);
  } catch {
    return false;
  }
}

function proofHash(linkedinUrl: string, facebookUrl: string) {
  return createHash("sha256").update(`${linkedinUrl}|${facebookUrl}`).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { action, whatsapp, source } = parsed.data;
  const normalizedSource = source ?? "general";
  const bonusForClaim = BONUS_BY_SOURCE[normalizedSource] ?? DEFAULT_BONUS;
  const claimKey = `${action}:${normalizedSource}`;
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bonusClaimed: true, bonusLeads: true, referralCode: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse claimed actions
  const claimed = parseClaimed(user.bonusClaimed);

  if (claimed.includes(claimKey) || claimed.includes(action)) {
    return NextResponse.json({
      alreadyClaimed: true,
      bonusLeads: user.bonusLeads,
      bonusAdded: 0,
      localDailyLimit: normalizedSource === "local-leads" ? FREE_LOCAL_BASE_LIMIT + (user.bonusLeads ?? 0) : undefined,
      message: `You already claimed this bonus.`,
    });
  }

  const nextClaimed = [...claimed, claimKey];

  if (action === "share") {
    const opened = new Set(parsed.data.openedPlatforms ?? []);
    const linkedinProof = parsed.data.linkedinProfileUrl;
    const facebookProof = parsed.data.facebookProfileUrl;
    if (!opened.has("linkedin") || !opened.has("facebook")) {
      return NextResponse.json({ error: "Please open both share screens before claiming." }, { status: 400 });
    }
    if (!linkedinProof || !isLinkedInProof(linkedinProof)) {
      return NextResponse.json({ error: "Add a valid LinkedIn profile or post URL." }, { status: 400 });
    }
    if (!facebookProof || !isFacebookProof(facebookProof)) {
      return NextResponse.json({ error: "Add a valid Facebook profile or post URL." }, { status: 400 });
    }
    nextClaimed.push(`share-proof:${normalizedSource}:${proofHash(linkedinProof, facebookProof)}`);
  }

  // Generate referral code if not already set
  const referralCode = user.referralCode ?? genCode();

  // Build update data
  const updateData: Record<string, unknown> = {
    bonusLeads:    { increment: bonusForClaim },
    bonusClaimed:  JSON.stringify(nextClaimed),
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

  const newBonusLeads = (user.bonusLeads ?? 0) + bonusForClaim;

  return NextResponse.json({
    success: true,
    bonusAdded: bonusForClaim,
    bonusLeads: newBonusLeads,
    newLimit: 20 + newBonusLeads, // remote/live free plan base + bonus
    localDailyLimit: normalizedSource === "local-leads" ? FREE_LOCAL_BASE_LIMIT + newBonusLeads : undefined,
    referralCode,
    referralUrl: `https://icloseleads.com/auth?mode=signup&ref=${referralCode}`,
    message: `+${bonusForClaim} leads unlocked.`,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bonusLeads: true, bonusClaimed: true, referralCode: true, whatsapp: true },
  });

  const claimed = parseClaimed(user?.bonusClaimed);

  return NextResponse.json({
    bonusLeads:    user?.bonusLeads ?? 0,
    claimed,
    referralCode:  user?.referralCode,
    whatsapp:      user?.whatsapp,
    canClaimShare:     !claimed.some(entry => entry === "share" || entry.startsWith("share:")),
    canClaimSubscribe: !claimed.includes("subscribe"),
  });
}
