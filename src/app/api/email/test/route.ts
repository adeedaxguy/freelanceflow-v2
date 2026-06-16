import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { smtpSend } from "@/lib/smtp-client";
import { z } from "zod";

const schema = z.object({
  host:      z.string().min(1),
  port:      z.number().int().min(1).max(65535),
  secure:    z.boolean(),
  user:      z.string().min(1),
  pass:      z.string().min(1),
  fromEmail: z.string().email(),
  fromName:  z.string().default(""),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch { raw = {}; }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const cfg = parsed.data;
  const toEmail = session.user.email ?? cfg.user;

  try {
    await smtpSend(
      cfg,
      toEmail,
      "✅ iCloseLeads — SMTP Connection Successful",
      `Hi,\n\nYour SMTP connection is working correctly.\n\nYou can now send emails directly from iCloseLeads using ${cfg.fromEmail}.\n\n— iCloseLeads`,
      `<div style="font-family:sans-serif;padding:24px;max-width:520px">
        <h2 style="color:#7C3AED">✅ SMTP Connected!</h2>
        <p>Your SMTP connection is working correctly.</p>
        <p>You can now send emails directly from iCloseLeads using <strong>${cfg.fromEmail}</strong>.</p>
        <p style="color:#888;font-size:12px">— iCloseLeads</p>
      </div>`,
    );
    return NextResponse.json({ success: true, message: `Test email sent to ${toEmail}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
