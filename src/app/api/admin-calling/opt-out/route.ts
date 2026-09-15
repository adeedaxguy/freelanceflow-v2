import { NextRequest, NextResponse } from "next/server";
import { suppressCallingToken } from "@/lib/admin-calling-service";
import { securityRateLimit, getClientIp } from "@/lib/security-rate-limit";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-call-token") || "";
    if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await securityRateLimit("admin-calling-optout", getClientIp(req.headers), 60, 60000)).allowed) return NextResponse.json({ error: "Too many requests. End the call now." }, { status: 429 });
    const ok = await suppressCallingToken(token);
    return NextResponse.json(ok ? { suppressed: true, instruction: "End the call now." } : { error: "Unauthorized" }, { status: ok ? 200 : 401 });
  } catch { return NextResponse.json({ error: "Suppression could not be saved. End the call immediately." }, { status: 503 }); }
}
