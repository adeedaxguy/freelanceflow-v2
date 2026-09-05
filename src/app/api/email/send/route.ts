export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { getResolvedOutreachUsage } from "@/lib/outreach-limits";
import { rateLimitHeaders, securityRateLimit } from "@/lib/security-rate-limit";
import { z } from "zod";

const sendSchema = z.object({
  to:      z.string().trim().email("Invalid recipient email").max(254),
  subject: z.string().trim().min(1, "Subject is required").max(300),
  body:    z.string().min(10, "Body too short").max(20_000),
  leadId:  z.string().trim().max(128).optional(),
  company: z.string().trim().max(200).optional(),
  domain:  z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestLimit = await securityRateLimit(
    "email-send",
    session.user.id,
    10,
    60_000,
  );
  if (!requestLimit.allowed) {
    return NextResponse.json(
      { error: "Too many send attempts. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(requestLimit) },
    );
  }

  let raw: unknown;
  try { raw = await req.json(); } catch { raw = {}; }

  const parsed = sendSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { to, subject, body, leadId, company, domain } = parsed.data;

  // A caller may only attach an email to their own lead.
  let ownedLeadId: string | null = null;
  if (leadId) {
    const ownedLead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
      select: { id: true },
    });
    if (!ownedLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    ownedLeadId = ownedLead.id;
  }

  // Resolve sender name from user profile
  let fromName = "iCloseLeads";
  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
    if (user?.name) fromName = user.name;
  } catch { /* keep default */ }

  const result = await sendMail(session.user.id, { to, subject, text: body, fromName });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to send email" },
      { status: result.code === "OUTREACH_LIMIT" ? 429 : 500 },
    );
  }

  // Log sent email
  try {
    await prisma.sentEmail.create({
      data: {
        userId:   session.user.id,
        leadId:   ownedLeadId,
        subject,
        body,
        status:   "SENT",
        resendId: result.id ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to log sent email:", err);
    // Don't fail the request — email was sent successfully
  }

  // Update lead status if leadId provided
  if (ownedLeadId) {
    await prisma.lead.updateMany({
      where: { id: ownedLeadId, userId: session.user.id },
      data: { status: "CONTACTED" },
    }).catch(() => null);
  }

  // Auto-save lead if domain provided but no leadId
  if (!leadId && domain && company) {
    await prisma.lead.create({
      data: { userId: session.user.id, company, domain, email: to, status: "CONTACTED" },
    }).catch(() => null);
  }

  const usage = await getResolvedOutreachUsage({
    userId: session.user.id,
    sessionPlan: session.user.plan,
    sessionEmail: session.user.email,
  });
  return NextResponse.json({ success: true, provider: result.provider, id: result.id, usage });
}
