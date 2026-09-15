import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { retellKey, retellCallSchema, verifyRetellSignature } from "@/lib/admin-calling-retell";
import { saveRetellNotes } from "@/lib/admin-calling-service";
import { readLimitedText } from "@/lib/safe-fetch";

export const dynamic = "force-dynamic";
const eventSchema = z.object({ event: z.enum(["call_ended", "call_analyzed"]), call: retellCallSchema });
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-retell-signature") || "";
  if (!/^v=\d{13},d=[a-f0-9]{64}$/i.test(signature)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let raw: string;
  try { raw = await readLimitedText(new Response(req.body), 256000); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 413 }); }
  try {
    if (!verifyRetellSignature(raw, signature, await retellKey())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const event = eventSchema.safeParse(JSON.parse(raw));
    if (!event.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    await saveRetellNotes(event.data.call, event.data.event === "call_analyzed");
    return new NextResponse(null, { status: 204 });
  } catch { return NextResponse.json({ error: "Call notes could not be saved" }, { status: 503 }); }
}
