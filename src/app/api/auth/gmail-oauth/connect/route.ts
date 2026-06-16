export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildGmailAuthUrl } from "@/lib/gmail-oauth";

/**
 * GET /api/auth/gmail-oauth/connect
 * Redirects the authenticated user to Google's OAuth consent screen
 * requesting the gmail.send scope.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Google OAuth is not configured on this server." },
      { status: 503 },
    );
  }

  try {
    const url = buildGmailAuthUrl(session.user.id);
    return NextResponse.redirect(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to build auth URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
