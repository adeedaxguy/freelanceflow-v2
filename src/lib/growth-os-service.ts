import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function authorizeGrowthOs(request: NextRequest): { ok: true } | { ok: false; status: number; error: string } {
  const expected = process.env.GROWTH_OS_SERVICE_TOKEN?.trim();
  if (!expected || expected.length < 32) {
    return { ok: false, status: 503, error: "Growth OS service access is not configured." };
  }
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!supplied || !timingSafeEqual(digest(supplied), digest(expected))) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }
  return { ok: true };
}

export const growthOsHeaders = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
};
