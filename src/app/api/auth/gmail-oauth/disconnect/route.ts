export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteGmailTokens } from "@/lib/gmail-oauth";

/**
 * DELETE /api/auth/gmail-oauth/disconnect
 * Removes the stored Gmail OAuth2 tokens for the current user.
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteGmailTokens(session.user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Disconnect failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
