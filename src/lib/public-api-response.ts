import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { API_SECURITY_HEADERS, type ApiAuthorization } from "@/lib/public-api";

export function apiResponse(data: unknown, auth?: ApiAuthorization, status = 200) {
  const headers: Record<string, string> = {
    ...API_SECURITY_HEADERS,
    "X-Request-Id": randomUUID(),
  };
  if (auth?.limit !== undefined) headers["X-RateLimit-Limit"] = String(auth.limit);
  if (auth?.remaining !== undefined) headers["X-RateLimit-Remaining"] = String(auth.remaining);
  if (auth?.resetAt) headers["X-RateLimit-Reset"] = auth.resetAt;
  return NextResponse.json(data, { status, headers });
}

export function apiError(auth: Extract<ApiAuthorization, { ok: false }>) {
  return apiResponse({ error: { code: auth.code, message: auth.error } }, auth, auth.status);
}
