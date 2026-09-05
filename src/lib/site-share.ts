import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import type { SitePreviewSearchParams } from "@/components/SitePreviewPageContent";

const MAX_TOKEN_BYTES = 6_000;

function secret() {
  const value = process.env.SITE_SHARE_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!value) throw new Error("Site share signing secret is not configured");
  return value;
}

function signature(body: string) {
  return createHmac("sha256", secret()).update(body).digest().subarray(0, 16).toString("base64url");
}

export function encodeSiteShare(params: SitePreviewSearchParams) {
  const json = JSON.stringify(params);
  const body = deflateRawSync(Buffer.from(json)).toString("base64url");
  return `${body}.${signature(body)}`;
}

export function decodeSiteShare(token: string): SitePreviewSearchParams | null {
  const [body, receivedSignature] = token.split(".");
  if (!body || !receivedSignature || body.length > MAX_TOKEN_BYTES) return null;

  const expected = signature(body);
  const received = Buffer.from(receivedSignature);
  const trusted = Buffer.from(expected);
  if (received.length !== trusted.length || !timingSafeEqual(received, trusted)) return null;

  try {
    const value = JSON.parse(inflateRawSync(Buffer.from(body, "base64url"), {
      maxOutputLength: 32_000,
    }).toString("utf8")) as SitePreviewSearchParams;
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}
