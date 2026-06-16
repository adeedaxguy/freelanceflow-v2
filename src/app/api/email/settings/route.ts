export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserSmtpConfig, saveUserSmtpConfig, deleteUserSmtpConfig } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const smtpSchema = z.object({
  host:      z.string().min(1, "SMTP host required"),
  port:      z.number().int().min(1).max(65535).default(587),
  secure:    z.boolean().default(false),
  user:      z.string().min(1, "SMTP username required"),
  pass:      z.string().min(1, "SMTP password required"),
  fromEmail: z.string().email("Invalid from email"),
  fromName:  z.string().default(""),
});

// GET — return current SMTP config + Gmail OAuth status (password masked)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check Gmail OAuth2 connection
  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { gmailRefreshToken: true, gmailEmail: true },
  }).catch(() => null);

  const gmailConnected = !!userRow?.gmailRefreshToken;
  const gmailEmail     = userRow?.gmailEmail ?? null;

  const cfg = await getUserSmtpConfig(session.user.id);
  if (!cfg) {
    return NextResponse.json({ connected: false, gmailConnected, gmailEmail });
  }

  return NextResponse.json({
    connected:      true,
    gmailConnected,
    gmailEmail,
    host:           cfg.host,
    port:           cfg.port,
    secure:         cfg.secure,
    user:           cfg.user,
    pass:           "••••••••",   // never return real password
    fromEmail:      cfg.fromEmail,
    fromName:       cfg.fromName,
  });
}

// POST — save SMTP config
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch { raw = {}; }

  const parsed = smtpSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await saveUserSmtpConfig(session.user.id, parsed.data);
  return NextResponse.json({ success: true });
}

// DELETE — disconnect SMTP
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteUserSmtpConfig(session.user.id);
  return NextResponse.json({ success: true });
}
