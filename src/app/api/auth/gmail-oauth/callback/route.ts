export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exchangeGmailCode, saveGmailTokens, verifyGmailOAuthState } from "@/lib/gmail-oauth";

/**
 * GET /api/auth/gmail-oauth/callback?code=...&state=...
 * Google redirects here after the user grants permission.
 * We exchange the one-time code for tokens and store the refresh token.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const successUrl = `${base}/dashboard/email-settings?gmail=connected`;
  const errorUrl   = (msg: string) =>
    `${base}/dashboard/email-settings?gmail=error&msg=${encodeURIComponent(msg)}`;

  // User denied access
  if (error) {
    return NextResponse.redirect(errorUrl(error === "access_denied" ? "Access denied" : "Google authorization failed"));
  }

  if (!code) {
    return NextResponse.redirect(errorUrl("No authorization code received"));
  }

  // Verify the state matches the logged-in user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(errorUrl("You must be logged in to connect Gmail"));
  }
  if (!state || verifyGmailOAuthState(state) !== session.user.id) {
    return NextResponse.redirect(errorUrl("Session mismatch — please try again"));
  }

  try {
    const tokens = await exchangeGmailCode(code);
    await saveGmailTokens(session.user.id, tokens);
    return NextResponse.redirect(successUrl);
  } catch (e) {
    console.error("Gmail OAuth callback failed:", e);
    return NextResponse.redirect(errorUrl("Could not connect Gmail. Please try again."));
  }
}
