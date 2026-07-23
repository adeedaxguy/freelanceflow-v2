import { NextResponse } from "next/server";
import { twilio } from "@/lib/telephony";

export const dynamic = "force-dynamic";

function unavailable() {
  const response = new twilio.twiml.VoiceResponse();
  response.say("The calling service is temporarily unavailable. Please try again shortly.");
  response.hangup();
  return new NextResponse(response.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const GET = unavailable;
export const POST = unavailable;
