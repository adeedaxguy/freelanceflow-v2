export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  OUTREACH_PREPARED_STATUS,
  getOutreachUsage,
  gmailComposeUrl,
  mailtoUrl,
  outreachLimitError,
  resolveOutreachPlan,
} from "@/lib/outreach-limits";

const prepareSchema = z.object({
  to:      z.string().email("Invalid recipient email"),
  subject: z.string().min(1, "Subject is required").max(300, "Subject is too long"),
  body:    z.string().min(10, "Body too short").max(10_000, "Body is too long"),
  leadId:  z.string().optional(),
  company: z.string().optional(),
  domain:  z.string().optional(),
});

async function resolveLeadId(params: {
  userId: string;
  leadId?: string;
  company?: string;
  domain?: string;
  to: string;
}): Promise<string | null> {
  if (params.leadId) {
    const lead = await prisma.lead.findFirst({
      where: { id: params.leadId, userId: params.userId },
      select: { id: true },
    });
    return lead?.id ?? null;
  }

  const company = params.company?.trim();
  const domain = params.domain?.trim();
  if (!company || !domain) return null;

  const existing = await prisma.lead.findFirst({
    where: {
      userId: params.userId,
      company,
      domain,
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const lead = await prisma.lead.create({
    data: {
      userId: params.userId,
      company,
      domain,
      email: params.to,
      status: "NEW",
      source: "email-compose",
    },
    select: { id: true },
  }).catch(() => null);

  return lead?.id ?? null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch { raw = {}; }

  const parsed = prepareSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const outreachPlan = await resolveOutreachPlan({
    userId: session.user.id,
    sessionPlan: session.user.plan,
    sessionEmail: session.user.email,
  });
  const usage = await getOutreachUsage(session.user.id, outreachPlan);
  const limitError = outreachLimitError(usage);
  if (limitError) {
    return NextResponse.json({ error: limitError, usage }, { status: 429 });
  }

  const { to, subject, body, leadId, company, domain } = parsed.data;
  const resolvedLeadId = await resolveLeadId({
    userId: session.user.id,
    leadId,
    company,
    domain,
    to,
  });

  await prisma.sentEmail.create({
    data: {
      userId:   session.user.id,
      leadId:   resolvedLeadId,
      subject,
      body,
      status:   OUTREACH_PREPARED_STATUS,
      resendId: "gmail-compose",
    },
  });

  const nextUsage = await getOutreachUsage(session.user.id, outreachPlan);

  return NextResponse.json({
    success: true,
    status: OUTREACH_PREPARED_STATUS,
    composeUrl: gmailComposeUrl({ to, subject, body }),
    mailtoUrl: mailtoUrl({ to, subject, body }),
    usage: nextUsage,
  });
}
