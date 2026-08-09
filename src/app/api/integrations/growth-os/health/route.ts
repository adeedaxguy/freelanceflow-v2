import { NextRequest, NextResponse } from "next/server";
import { authorizeGrowthOs, growthOsHeaders } from "@/lib/growth-os-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = authorizeGrowthOs(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: growthOsHeaders });
  return NextResponse.json({ ok: true, service: "icloseleads-growth-signals", version: 1, checkedAt: new Date().toISOString() }, { headers: growthOsHeaders });
}
