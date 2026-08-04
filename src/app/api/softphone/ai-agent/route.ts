import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createVoiceAgentState, parseVoiceAgentState, serializeVoiceAgentState } from "@/lib/ai-voice-agent";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  isTelephonyConfigured,
  listWorkspacePhoneNumbers,
  normalizeDestination,
  selectAuthorizedCallerId,
  startAiVoiceCall,
  stopVoiceCall,
} from "@/lib/telephony";

export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    to: z.string().trim().min(8).max(30),
    from: z.string().trim().min(8).max(30),
    companyName: z.string().trim().min(2).max(120),
    contactName: z.string().trim().max(120).default(""),
    campaignContext: z.string().trim().min(20).max(1_200),
    consentBasis: z.string().trim().min(10).max(500),
    consentConfirmed: z.literal(true),
    leadId: z.string().trim().max(80).optional(),
  }),
  z.object({ action: z.literal("cancel"), recordId: z.string().trim().min(1).max(80) }),
]);

async function adminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "ADMIN") return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  return { session };
}

function publicAgentCall(call: {
  id: string;
  from: string;
  to: string;
  status: string;
  outcome: string | null;
  durationSeconds: number | null;
  createdAt: Date;
  endedAt: Date | null;
  notes: string | null;
}) {
  const state = parseVoiceAgentState(call.notes);
  return {
    id: call.id,
    from: call.from,
    to: call.to,
    status: call.status,
    outcome: call.outcome,
    durationSeconds: call.durationSeconds,
    createdAt: call.createdAt,
    endedAt: call.endedAt,
    companyName: state?.companyName || "",
    contactName: state?.contactName || "",
    transcript: state?.transcript || [],
  };
}

export async function GET() {
  const auth = await adminSession();
  if ("error" in auth) return auth.error;
  const calls = await prisma.voiceCall.findMany({
    where: { userId: auth.session.user.id, direction: "OUTBOUND_AI" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      from: true,
      to: true,
      status: true,
      outcome: true,
      durationSeconds: true,
      createdAt: true,
      endedAt: true,
      notes: true,
    },
  });
  return NextResponse.json({ calls: calls.map(publicAgentCall) });
}

export async function POST(req: NextRequest) {
  const auth = await adminSession();
  if ("error" in auth) return auth.error;
  if (!isTelephonyConfigured()) return NextResponse.json({ error: "Twilio is not configured yet" }, { status: 503 });

  const parsed = requestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Complete every required AI call field" }, { status: 400 });
  const limit = rateLimit(`ai-softphone:${auth.session.user.id}`, 20, 60 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: `Too many requests. Try again in ${limit.resetInSeconds}s.` }, { status: 429 });

  try {
    const workspace = await prisma.telephonyWorkspace.findUnique({ where: { userId: auth.session.user.id } });
    if (!workspace || workspace.status !== "READY") return NextResponse.json({ error: "Calling workspace is not ready" }, { status: 409 });

    if (parsed.data.action === "cancel") {
      const call = await prisma.voiceCall.findFirst({
        where: { id: parsed.data.recordId, userId: auth.session.user.id, direction: "OUTBOUND_AI" },
      });
      if (!call) return NextResponse.json({ error: "AI call was not found" }, { status: 404 });
      if (call.twilioCallSid && !call.endedAt) await stopVoiceCall(workspace, call.twilioCallSid).catch(() => undefined);
      const updated = await prisma.voiceCall.update({
        where: { id: call.id },
        data: { status: "canceled", outcome: "ADMIN_STOPPED", endedAt: new Date() },
      });
      return NextResponse.json({ call: publicAgentCall(updated) });
    }

    const destination = normalizeDestination(parsed.data.to);
    const callable = (await listWorkspacePhoneNumbers(auth.session.user.id))
      .filter(number => number.callable)
      .map(number => number.phoneNumber);
    const callerId = selectAuthorizedCallerId(parsed.data.from, callable);

    const [doNotCall, activeCall, callsToday, lead] = await Promise.all([
      prisma.voiceCall.findFirst({ where: { userId: auth.session.user.id, to: destination, outcome: "DO_NOT_CALL" }, select: { id: true } }),
      prisma.voiceCall.findFirst({
        where: {
          userId: auth.session.user.id,
          direction: "OUTBOUND_AI",
          status: { in: ["queued", "initiated", "ringing", "in-progress"] },
          endedAt: null,
        },
        select: { id: true },
      }),
      prisma.voiceCall.count({
        where: { userId: auth.session.user.id, direction: "OUTBOUND_AI", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) } },
      }),
      parsed.data.leadId
        ? prisma.lead.findFirst({ where: { id: parsed.data.leadId, userId: auth.session.user.id }, select: { id: true } })
        : null,
    ]);
    if (doNotCall) return NextResponse.json({ error: "This number opted out and is blocked from AI calls" }, { status: 409 });
    if (activeCall) return NextResponse.json({ error: "Finish the active AI call before starting another" }, { status: 409 });
    if (callsToday >= 10) return NextResponse.json({ error: "The daily AI-agent beta limit of 10 calls has been reached" }, { status: 429 });

    const state = createVoiceAgentState(parsed.data);
    const record = await prisma.voiceCall.create({
      data: {
        workspaceId: workspace.id,
        userId: auth.session.user.id,
        leadId: lead?.id,
        direction: "OUTBOUND_AI",
        from: callerId,
        to: destination,
        status: "queued",
        outcome: "ACTIVE",
        notes: serializeVoiceAgentState(state),
      },
    });

    try {
      const call = await startAiVoiceCall(workspace, record.id, destination, callerId);
      const updated = await prisma.voiceCall.update({
        where: { id: record.id },
        data: { twilioCallSid: call.sid, status: call.status || "queued" },
      });
      return NextResponse.json({ call: publicAgentCall(updated) });
    } catch (error) {
      await prisma.voiceCall.update({
        where: { id: record.id },
        data: { status: "failed", outcome: "FAILED", endedAt: new Date() },
      });
      throw error;
    }
  } catch (error) {
    console.error("[softphone/ai-agent]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI call failed" }, { status: 502 });
  }
}
