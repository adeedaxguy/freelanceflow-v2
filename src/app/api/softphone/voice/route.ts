import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  appUrl,
  hasPhoneSubscriptionAccess,
  latestPhonePurchase,
  normalizeDestination,
  twilio,
  validateTwilioWebhook,
} from "@/lib/telephony";

export const dynamic = "force-dynamic";

function xml(response: InstanceType<typeof twilio.twiml.VoiceResponse>) {
  return new NextResponse(response.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function formValues(form: FormData) {
  return Object.fromEntries([...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function finished(status: string) {
  return ["completed", "busy", "failed", "no-answer", "canceled"].includes(status);
}

export async function POST(req: NextRequest) {
  const params = formValues(await req.formData());
  const workspace = await validateTwilioWebhook(req, params);
  if (!workspace) return new NextResponse("Invalid signature", { status: 403 });

  const mode = req.nextUrl.searchParams.get("mode") || "outgoing";
  if (["status", "app-status", "number-status"].includes(mode)) {
    const recordId = req.nextUrl.searchParams.get("recordId");
    if (recordId) {
      const status = params.CallStatus || params.DialCallStatus || "unknown";
      const duration = Number(params.CallDuration || params.DialCallDuration || 0);
      const price = Math.abs(Number(params.Price || 0));
      await prisma.voiceCall.updateMany({
        where: { id: recordId, workspaceId: workspace.id },
        data: {
          status,
          durationSeconds: Number.isFinite(duration) ? duration : undefined,
          costCents: price > 0 ? Math.round(price * 100) : undefined,
          costCurrency: params.PriceUnit?.toUpperCase() || undefined,
          answeredAt: status === "in-progress" || status === "answered" ? new Date() : undefined,
          endedAt: finished(status) ? new Date() : undefined,
        },
      });
    }
    return new NextResponse(null, { status: 204 });
  }

  if (!workspace.phoneNumber) {
    const response = new twilio.twiml.VoiceResponse();
    response.say("This calling workspace does not have an active number.");
    response.hangup();
    return xml(response);
  }

  const user = await prisma.user.findUnique({
    where: { id: workspace.userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    const purchase = await latestPhonePurchase(workspace.userId);
    if (
      purchase?.status !== "ACTIVE"
      || !hasPhoneSubscriptionAccess(purchase.subscriptionStatus, purchase.endsAt)
    ) {
      const response = new twilio.twiml.VoiceResponse();
      response.say("This phone number subscription is not active.");
      response.hangup();
      return xml(response);
    }
  }

  const callSid = params.CallSid || null;
  if (mode === "incoming") {
    const record = callSid
      ? await prisma.voiceCall.upsert({
          where: { twilioCallSid: callSid },
          update: { status: params.CallStatus || "ringing" },
          create: {
            workspaceId: workspace.id,
            userId: workspace.userId,
            twilioCallSid: callSid,
            direction: "INBOUND",
            from: params.From || "unknown",
            to: workspace.phoneNumber,
            status: params.CallStatus || "ringing",
          },
        })
      : await prisma.voiceCall.create({
          data: {
            workspaceId: workspace.id,
            userId: workspace.userId,
            direction: "INBOUND",
            from: params.From || "unknown",
            to: workspace.phoneNumber,
            status: "ringing",
          },
        });
    const callback = appUrl(`/api/softphone/voice?mode=status&recordId=${encodeURIComponent(record.id)}`);
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial({ answerOnBridge: true, timeout: 25, timeLimit: 1800 });
    dial.client({ statusCallback: callback, statusCallbackMethod: "POST", statusCallbackEvent: ["initiated", "ringing", "answered", "completed"] }, `icl_user_${workspace.userId}`);
    return xml(response);
  }

  let destination: string;
  try {
    destination = normalizeDestination(params.To || "");
  } catch (error) {
    const response = new twilio.twiml.VoiceResponse();
    response.say(error instanceof Error ? error.message : "That destination is not supported.");
    response.hangup();
    return xml(response);
  }

  const callsToday = await prisma.voiceCall.count({
    where: { userId: workspace.userId, direction: "OUTBOUND", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) } },
  });
  if (callsToday >= 60) {
    const response = new twilio.twiml.VoiceResponse();
    response.say("Your daily beta calling limit has been reached.");
    response.hangup();
    return xml(response);
  }

  const requestedLeadId = params.LeadId?.slice(0, 80);
  const lead = requestedLeadId
    ? await prisma.lead.findFirst({ where: { id: requestedLeadId, userId: workspace.userId }, select: { id: true } })
    : null;
  const record = callSid
    ? await prisma.voiceCall.upsert({
        where: { twilioCallSid: callSid },
        update: { to: destination, leadId: lead?.id },
        create: {
          workspaceId: workspace.id,
          userId: workspace.userId,
          leadId: lead?.id,
          twilioCallSid: callSid,
          from: workspace.phoneNumber,
          to: destination,
          status: "initiated",
        },
      })
    : await prisma.voiceCall.create({
        data: {
          workspaceId: workspace.id,
          userId: workspace.userId,
          leadId: lead?.id,
          from: workspace.phoneNumber,
          to: destination,
          status: "initiated",
        },
      });

  const callback = appUrl(`/api/softphone/voice?mode=status&recordId=${encodeURIComponent(record.id)}`);
  const response = new twilio.twiml.VoiceResponse();
  const dial = response.dial({ callerId: workspace.phoneNumber, answerOnBridge: true, timeout: 30, timeLimit: 1800 });
  dial.number({ statusCallback: callback, statusCallbackMethod: "POST", statusCallbackEvent: ["initiated", "ringing", "answered", "completed"] }, destination);
  return xml(response);
}
