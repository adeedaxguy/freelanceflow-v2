import { NextRequest, NextResponse } from "next/server";
import {
  appendTranscript,
  generateVoiceAgentTurn,
  initialAgentMessage,
  isOptOut,
  parseVoiceAgentState,
  serializeVoiceAgentState,
} from "@/lib/ai-voice-agent";
import { prisma } from "@/lib/prisma";
import { appUrl, twilio, validateTwilioWebhook } from "@/lib/telephony";
import { getPlatformSetting } from "@/lib/platform-secrets";

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

function say(response: InstanceType<typeof twilio.twiml.VoiceResponse>, text: string) {
  response.say({ voice: "Polly.Matthew-Neural", language: "en-US" }, text);
}

function gatherPrompt(response: InstanceType<typeof twilio.twiml.VoiceResponse>, recordId: string, prompt: string) {
  const input = response.gather({
    input: ["speech", "dtmf"],
    numDigits: 1,
    timeout: 5,
    speechTimeout: "auto",
    actionOnEmptyResult: true,
    bargeIn: true,
    language: "en-US",
    hints: "stop, do not call, remove me, not interested, yes, no, later, interested",
    action: appUrl(`/api/softphone/ai-agent/voice?mode=turn&recordId=${encodeURIComponent(recordId)}`),
    method: "POST",
  });
  input.say({ voice: "Polly.Matthew-Neural", language: "en-US" }, prompt);
}

function finished(status: string) {
  return ["completed", "busy", "failed", "no-answer", "canceled"].includes(status);
}

export async function POST(req: NextRequest) {
  const params = formValues(await req.formData());
  const workspace = await validateTwilioWebhook(req, params);
  if (!workspace) return new NextResponse("Invalid signature", { status: 403 });

  const recordId = req.nextUrl.searchParams.get("recordId");
  if (!recordId) return new NextResponse("Missing call record", { status: 400 });
  const record = await prisma.voiceCall.findFirst({
    where: { id: recordId, workspaceId: workspace.id, direction: "OUTBOUND_AI" },
  });
  if (!record) return new NextResponse("Call record not found", { status: 404 });

  const mode = req.nextUrl.searchParams.get("mode") || "start";
  if (mode === "status") {
    const status = params.CallStatus || "unknown";
    const seconds = Number(params.CallDuration || 0);
    const price = Math.abs(Number(params.Price || 0));
    await prisma.voiceCall.update({
      where: { id: record.id },
      data: {
        status,
        durationSeconds: Number.isFinite(seconds) ? seconds : undefined,
        costCents: price > 0 ? Math.round(price * 100) : undefined,
        costCurrency: params.PriceUnit?.toUpperCase() || undefined,
        answeredAt: ["in-progress", "answered"].includes(status) ? new Date() : undefined,
        endedAt: finished(status) ? new Date() : undefined,
        outcome: ["failed", "busy", "no-answer"].includes(status) && record.outcome === "ACTIVE" ? "FAILED" : undefined,
      },
    });
    return new NextResponse(null, { status: 204 });
  }

  let state = parseVoiceAgentState(record.notes);
  if (!state) {
    const response = new twilio.twiml.VoiceResponse();
    say(response, "This AI call could not be prepared safely. Goodbye.");
    response.hangup();
    await prisma.voiceCall.update({ where: { id: record.id }, data: { status: "failed", outcome: "FAILED", endedAt: new Date() } });
    return xml(response);
  }

  const response = new twilio.twiml.VoiceResponse();
  if (mode === "start") {
    const message = initialAgentMessage(state);
    if (!state.transcript.some(entry => entry.speaker === "agent")) state = appendTranscript(state, "agent", message);
    await prisma.voiceCall.update({
      where: { id: record.id },
      data: { status: "in-progress", answeredAt: record.answeredAt || new Date(), notes: serializeVoiceAgentState(state) },
    });
    gatherPrompt(response, record.id, message);
    return xml(response);
  }

  const prospectText = (params.SpeechResult || "").trim();
  if (isOptOut(prospectText, params.Digits)) {
    state = appendTranscript(state, "prospect", prospectText || "Pressed 9");
    const message = "Understood. This number has been added to the do-not-call list. Goodbye.";
    state = appendTranscript(state, "agent", message);
    await prisma.voiceCall.update({
      where: { id: record.id },
      data: { notes: serializeVoiceAgentState(state), status: "completed", outcome: "DO_NOT_CALL", endedAt: new Date() },
    });
    say(response, message);
    response.hangup();
    return xml(response);
  }

  if (!prospectText) {
    state = { ...state, silenceCount: state.silenceCount + 1 };
    if (state.silenceCount >= 2) {
      const message = "I could not hear a response, so I will end the call now. Goodbye.";
      state = appendTranscript(state, "agent", message);
      await prisma.voiceCall.update({ where: { id: record.id }, data: { notes: serializeVoiceAgentState(state), status: "completed", outcome: "NO_RESPONSE", endedAt: new Date() } });
      say(response, message);
      response.hangup();
      return xml(response);
    }
    await prisma.voiceCall.update({ where: { id: record.id }, data: { notes: serializeVoiceAgentState(state) } });
    gatherPrompt(response, record.id, "I did not catch that. You can say stop or press 9, or answer the question when you are ready.");
    return xml(response);
  }

  state = appendTranscript({ ...state, turns: state.turns + 1, silenceCount: 0 }, "prospect", prospectText);
  if (state.turns >= 6) {
    const message = "Thank you for the conversation. I will pass these notes to Adnan for review. Goodbye.";
    state = appendTranscript(state, "agent", message);
    await prisma.voiceCall.update({ where: { id: record.id }, data: { notes: serializeVoiceAgentState(state), status: "completed", outcome: "FOLLOW_UP", endedAt: new Date() } });
    say(response, message);
    response.hangup();
    return xml(response);
  }

  const setting = await getPlatformSetting("groq_api_key").catch(() => "");
  const turn = await generateVoiceAgentTurn(state, prospectText, setting || process.env.GROQ_API_KEY);
  state = appendTranscript({ ...state, stage: turn.stage }, "agent", turn.reply);
  await prisma.voiceCall.update({
    where: { id: record.id },
    data: {
      notes: serializeVoiceAgentState(state),
      outcome: turn.outcome,
      status: turn.endCall ? "completed" : "in-progress",
      endedAt: turn.endCall ? new Date() : undefined,
    },
  });
  if (turn.endCall) {
    say(response, turn.reply);
    response.hangup();
  } else {
    gatherPrompt(response, record.id, turn.reply);
  }
  return xml(response);
}
