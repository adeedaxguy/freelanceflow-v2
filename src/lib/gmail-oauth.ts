/**
 * Gmail OAuth2 utilities — no extra npm packages required.
 * Uses the Gmail REST API with an OAuth2 Bearer token to send email.
 *
 * Flow:
 *  1. buildGmailAuthUrl()  → redirect user to Google consent screen
 *  2. exchangeGmailCode()  → swap one-time code for refresh_token
 *  3. saveGmailTokens()    → persist refresh_token on User row
 *  4. sendWithGmailOAuth() → refresh access token, then POST to Gmail API
 */

import { prisma } from "@/lib/prisma";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readStoredSecret, sealSecret } from "@/lib/secret-box";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GmailTokens {
  accessToken:  string;
  refreshToken: string;
  email:        string;
}

export interface MailPayload {
  to:       string;
  subject:  string;
  text:     string;
  html:     string;
  fromName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/api/auth/gmail-oauth/callback`;
}

/** Build base64url (URL-safe, no padding) */
function toBase64url(input: string): string {
  return Buffer.from(input).toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function headerValue(value: string, maxLength: number): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, maxLength);
}

const GMAIL_STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET not configured");
  return secret;
}

function signState(payload: string): string {
  return createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
}

/** Create a short-lived, signed state value that binds OAuth to this user. */
export function createGmailOAuthState(userId: string): string {
  if (!userId || userId.length > 128) throw new Error("Invalid Gmail OAuth user");
  const payload = toBase64url(JSON.stringify({
    userId,
    nonce: randomBytes(16).toString("hex"),
    expiresAt: Date.now() + GMAIL_STATE_TTL_MS,
  }));
  return `${payload}.${signState(payload)}`;
}

/** Verify signature, shape, and expiry before accepting an OAuth callback. */
export function verifyGmailOAuthState(state: string): string | null {
  if (!state || state.length > 1024) return null;
  const [payload, signature, ...extra] = state.split(".");
  if (!payload || !signature || extra.length > 0) return null;

  try {
    const expected = signState(payload);
    const providedBytes = Buffer.from(signature);
    const expectedBytes = Buffer.from(expected);
    if (providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: unknown;
      nonce?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof decoded.userId !== "string" ||
      decoded.userId.length === 0 ||
      decoded.userId.length > 128 ||
      typeof decoded.nonce !== "string" ||
      decoded.nonce.length < 16 ||
      typeof decoded.expiresAt !== "number" ||
      !Number.isFinite(decoded.expiresAt) ||
      decoded.expiresAt < Date.now()
    ) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

// ─── Step 1: Build auth URL ───────────────────────────────────────────────────

export function buildGmailAuthUrl(userId: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  getRedirectUri(),
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "email",
      "profile",
    ].join(" "),
    access_type: "offline",
    prompt:      "consent",       // force refresh_token even if previously granted
    state:       createGmailOAuthState(userId),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ─── Step 2: Exchange code for tokens ────────────────────────────────────────

export async function exchangeGmailCode(code: string): Promise<GmailTokens> {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth not configured");

  // Exchange code → tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  getRedirectUri(),
      grant_type:    "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json() as {
    access_token?: string; refresh_token?: string;
    error?: string; error_description?: string;
  };

  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description ?? tokenData.error ?? "Token exchange failed");
  }

  if (!tokenData.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. " +
      "Please revoke access at myaccount.google.com/permissions and try again."
    );
  }

  // Fetch user email from userinfo
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const info = await infoRes.json() as { email?: string };

  return {
    accessToken:  tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    email:        info.email ?? "",
  };
}

// ─── Step 3: Persist tokens ───────────────────────────────────────────────────

export async function saveGmailTokens(userId: string, tokens: GmailTokens): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      gmailRefreshToken: sealSecret(tokens.refreshToken),
      gmailEmail:        tokens.email,
    },
  });
}

export async function deleteGmailTokens(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      gmailRefreshToken: null,
      gmailEmail:        null,
    },
  });
}

// ─── Step 4: Refresh access token ────────────────────────────────────────────

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth not configured");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    "refresh_token",
    }),
  });

  const data = await res.json() as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? "Token refresh failed");
  }
  return data.access_token;
}

// ─── Step 5: Send via Gmail REST API ─────────────────────────────────────────

export async function sendWithGmailOAuth(
  refreshToken: string,
  gmailEmail:   string,
  payload:      MailPayload,
): Promise<string> {
  const accessToken = await refreshAccessToken(refreshToken);

  // Build RFC 2822 MIME message
  const boundary = `ff_boundary_${Date.now()}`;
  const safeEmail = headerValue(gmailEmail, 254);
  const safeFromName = headerValue(payload.fromName, 120).replace(/"/g, "");
  const fromDisplay = safeFromName
    ? `"${safeFromName}" <${safeEmail}>`
    : safeEmail;

  const mime = [
    `From: ${fromDisplay}`,
    `To: ${headerValue(payload.to, 254)}`,
    `Subject: ${headerValue(payload.subject, 300)}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    payload.text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    payload.html,
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  const raw = toBase64url(mime);

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  if (!res.ok) {
    const err = await res.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? "Gmail API send failed");
  }

  const result = await res.json() as { id?: string };
  return result.id ?? "gmail-sent";
}

// ─── Convenience: load tokens for a user and send ────────────────────────────

export async function sendMailViaGmail(
  userId:  string,
  payload: MailPayload,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gmailRefreshToken: true, gmailEmail: true },
    });
    if (!user?.gmailRefreshToken || !user.gmailEmail) {
      return { success: false, error: "Gmail not connected" };
    }
    const refreshToken = readStoredSecret(user.gmailRefreshToken);
    if (!refreshToken) return { success: false, error: "Gmail connection is no longer valid" };
    if (!user.gmailRefreshToken.startsWith("enc:v1:")) {
      await prisma.user.update({
        where: { id: userId },
        data: { gmailRefreshToken: sealSecret(refreshToken) },
      }).catch(() => undefined);
    }
    const id = await sendWithGmailOAuth(
      refreshToken,
      user.gmailEmail,
      payload,
    );
    return { success: true, id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gmail send failed" };
  }
}
