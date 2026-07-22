import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  createVoiceToken,
  isSoftphoneAllowed,
  isTelephonyConfigured,
  provisionWorkspace,
  publicWorkspace,
  purchasePhoneNumber,
  searchPhoneNumbers,
} from "@/lib/telephony";

export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("provision") }),
  z.object({
    action: z.literal("search-numbers"),
    country: z.enum(["US", "GB", "CA"]),
    area: z.string().trim().max(40).default(""),
  }),
  z.object({
    action: z.literal("purchase-number"),
    quote: z.string().min(20).max(3000),
    confirmation: z.literal("PURCHASE"),
    complianceAccepted: z.literal(true),
  }),
  z.object({ action: z.literal("token") }),
]);

async function context() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isSoftphoneAllowed(session.user.role, session.user.plan)) {
    return { error: NextResponse.json({ error: "Softphone is not released for this account yet" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await context();
  if ("error" in auth) return auth.error;

  const [workspace, calls] = await Promise.all([
    prisma.telephonyWorkspace.findUnique({ where: { userId: auth.session.user.id } }),
    prisma.voiceCall.findMany({
      where: { userId: auth.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        direction: true,
        from: true,
        to: true,
        status: true,
        durationSeconds: true,
        createdAt: true,
        outcome: true,
      },
    }),
  ]);

  return NextResponse.json({
    configured: isTelephonyConfigured(),
    workspace: publicWorkspace(workspace),
    calls,
  });
}

export async function POST(req: NextRequest) {
  const auth = await context();
  if ("error" in auth) return auth.error;
  if (!isTelephonyConfigured()) {
    return NextResponse.json({ error: "Twilio is not configured yet" }, { status: 503 });
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const limit = rateLimit(`softphone:${parsed.data.action}:${auth.session.user.id}`, parsed.data.action === "token" ? 60 : 12, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.resetInSeconds}s.` }, { status: 429 });
  }

  try {
    if (parsed.data.action === "provision") {
      const workspace = await provisionWorkspace(auth.session.user.id);
      return NextResponse.json({ workspace: publicWorkspace(workspace) });
    }

    if (parsed.data.action === "search-numbers") {
      const numbers = await searchPhoneNumbers(auth.session.user.id, parsed.data.country, parsed.data.area);
      return NextResponse.json({ numbers });
    }

    if (parsed.data.action === "purchase-number") {
      const workspace = await purchasePhoneNumber(auth.session.user.id, parsed.data.quote);
      return NextResponse.json({ workspace: publicWorkspace(workspace) });
    }

    const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId: auth.session.user.id } });
    if (!workspace?.phoneNumber) return NextResponse.json({ error: "Choose a calling number first" }, { status: 409 });
    return NextResponse.json({ token: createVoiceToken(workspace), identity: `icl_user_${auth.session.user.id}` });
  } catch (error) {
    console.error(`[softphone/${parsed.data.action}]`, error);
    const message = error instanceof Error ? error.message : "Softphone request failed";
    const status = /not ready|already has|in progress|no longer available|expired|invalid|unsupported|does not belong/i.test(message) ? 409 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
