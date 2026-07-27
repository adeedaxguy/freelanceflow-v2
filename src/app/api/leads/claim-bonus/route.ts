import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
const genCode = () => randomBytes(4).toString("hex").toUpperCase();

const DEFAULT_BONUS = 300;
const FREE_LOCAL_BASE_LIMIT = 100;

const schema = z.object({
  action:             z.literal("share"),
  source:             z.string().optional(), // "live-jobs" | "remote-leads" | "local-leads"
  openedPlatforms:    z.array(z.enum(["linkedin", "facebook"])).optional(),
  linkedinPostUrl:    z.string().url().optional(),
  facebookPostUrl:    z.string().url().optional(),
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
    return host === "linkedin.com" && (
      /^\/posts\/[^/]+/i.test(url.pathname) ||
      /^\/feed\/update\/urn:li:(activity|share):\d+\/?$/i.test(url.pathname)
    );
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
    return (
      /^\/share\/[A-Za-z0-9_-]+/i.test(path) ||
      /^\/[^/]+\/posts\/[^/]+/i.test(path) ||
      /^\/groups\/[^/]+\/posts\/[^/]+/i.test(path) ||
      (/^\/permalink\.php$/i.test(path) && url.searchParams.has("story_fbid"))
    );
  } catch {
    return false;
  }
}

function proofHash(linkedinUrl: string, facebookUrl: string) {
  return createHash("sha256").update(`${linkedinUrl}|${facebookUrl}`).digest("hex").slice(0, 16);
}

function hasShareClaim(claimed: string[]) {
  return claimed.some(entry => entry === "share" || entry.startsWith("share:"));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { action, source } = parsed.data;
  const normalizedSource = source ?? "general";
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bonusClaimed: true, bonusLeads: true, referralCode: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse claimed actions
  const claimed = parseClaimed(user.bonusClaimed);

  if (hasShareClaim(claimed)) {
    return NextResponse.json({
      alreadyClaimed: true,
      bonusLeads: user.bonusLeads,
      bonusAdded: 0,
      localDailyLimit: normalizedSource === "local-leads" ? FREE_LOCAL_BASE_LIMIT + (user.bonusLeads ?? 0) : undefined,
      message: `You already claimed this bonus.`,
    });
  }

  const opened = new Set(parsed.data.openedPlatforms ?? []);
  const linkedinProof = parsed.data.linkedinPostUrl;
  const facebookProof = parsed.data.facebookPostUrl;
  if (!opened.has("linkedin") || !opened.has("facebook")) {
    return NextResponse.json({ error: "Please open both share screens before claiming." }, { status: 400 });
  }
  if (!linkedinProof || !isLinkedInProof(linkedinProof)) {
    return NextResponse.json({ error: "Add the URL of your published LinkedIn post." }, { status: 400 });
  }
  if (!facebookProof || !isFacebookProof(facebookProof)) {
    return NextResponse.json({ error: "Add the URL of your published Facebook post." }, { status: 400 });
  }

  const hash = proofHash(linkedinProof, facebookProof);
  const reusedProof = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      bonusClaimed: { contains: hash },
    },
    select: { id: true },
  });
  if (reusedProof) {
    return NextResponse.json(
      { error: "These post links have already been used for a bonus claim." },
      { status: 409 },
    );
  }

  const nextClaimed = [
    ...claimed,
    action,
    `share-source:${normalizedSource}`,
    `share-proof:${hash}`,
  ];

  // Generate referral code if not already set
  const referralCode = user.referralCode ?? genCode();

  const claimResult = await prisma.user.updateMany({
    where: {
      id: userId,
      OR: [
        { bonusClaimed: null },
        { bonusClaimed: { not: { contains: "\"share" } } },
      ],
    },
    data: {
      bonusLeads: { increment: DEFAULT_BONUS },
      bonusClaimed: JSON.stringify(nextClaimed),
      referralCode,
    },
  });
  if (claimResult.count === 0) {
    return NextResponse.json({
      alreadyClaimed: true,
      bonusLeads: user.bonusLeads,
      bonusAdded: 0,
      message: "You already claimed this bonus.",
    });
  }

  const newBonusLeads = (user.bonusLeads ?? 0) + DEFAULT_BONUS;

  return NextResponse.json({
    success: true,
    bonusAdded: DEFAULT_BONUS,
    bonusLeads: newBonusLeads,
    newLimit: FREE_LOCAL_BASE_LIMIT + newBonusLeads,
    localDailyLimit: normalizedSource === "local-leads" ? FREE_LOCAL_BASE_LIMIT + newBonusLeads : undefined,
    referralCode,
    referralUrl: `https://icloseleads.com/auth?mode=signup&ref=${referralCode}`,
    message: `+${DEFAULT_BONUS} leads unlocked across all lead tools.`,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const source = req.nextUrl.searchParams.get("source") ?? "general";

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
    canClaimShare: !hasShareClaim(claimed),
  });
}
