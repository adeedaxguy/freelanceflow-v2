export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWithGmailOAuth } from "@/lib/gmail-oauth";

/**
 * POST /api/auth/gmail-oauth/test
 * Sends a test email to the connected Gmail address to verify the connection works.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { gmailRefreshToken: true, gmailEmail: true, name: true },
  }).catch(() => null);

  if (!user?.gmailRefreshToken || !user.gmailEmail) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  try {
    await sendWithGmailOAuth(
      user.gmailRefreshToken,
      user.gmailEmail,
      {
        to:       user.gmailEmail,
        subject:  "iCloseLeads — Gmail connection test ✓",
        fromName: user.name ?? "iCloseLeads",
        text:     "Your Gmail is connected to iCloseLeads and working correctly. You can now send proposals directly from your Gmail address.",
        html:     `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:32px;background:#f9f9f9">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <h2 style="color:#4f46e5;margin:0 0 16px">✓ Gmail Connected</h2>
  <p style="margin:0 0 12px;line-height:1.6;color:#374151">Your Gmail account is connected to iCloseLeads and working correctly.</p>
  <p style="margin:0 0 12px;line-height:1.6;color:#374151">You can now send proposals and follow-ups directly from <strong>${user.gmailEmail}</strong>.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#9ca3af;font-size:12px;margin:0">Sent by iCloseLeads</p>
</div></body></html>`,
      },
    );
    return NextResponse.json({ success: true, sentTo: user.gmailEmail });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Send failed";
    const isApiDisabled = msg.toLowerCase().includes("disabled") ||
                          msg.toLowerCase().includes("not been used") ||
                          msg.toLowerCase().includes("403");
    return NextResponse.json({
      error: isApiDisabled
        ? "Gmail API is not enabled. Go to console.cloud.google.com → APIs & Services → Library → search 'Gmail API' → click Enable. Then click Reconnect below."
        : `Gmail send failed: ${msg}`,
    }, { status: 500 });
  }
}
