import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendSchema = z.object({
  to:      z.string().email("Invalid recipient email"),
  subject: z.string().min(1, "Subject is required"),
  body:    z.string().min(10, "Body too short"),
  leadId:  z.string().optional(),
  company: z.string().optional(),
  domain:  z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch { raw = {}; }

  const parsed = sendSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { to, subject, body, leadId, company, domain } = parsed.data;

  // Resolve sender name from user profile
  let fromName = "iCloseLeads";
  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
    if (user?.name) fromName = user.name;
  } catch { /* keep default */ }

  const result = await sendMail(session.user.id, { to, subject, text: body, fromName });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Failed to send email" }, { status: 500 });
  }

  // Log sent email
  try {
    await prisma.sentEmail.create({
      data: {
        userId:   session.user.id,
        leadId:   leadId ?? null,
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
  if (leadId) {
    await prisma.lead.update({ where: { id: leadId }, data: { status: "CONTACTED" } }).catch(() => null);
  }

  // Auto-save lead if domain provided but no leadId
  if (!leadId && domain && company) {
    await prisma.lead.create({
      data: { userId: session.user.id, company, domain, email: to, status: "CONTACTED" },
    }).catch(() => null);
  }

  return NextResponse.json({ success: true, provider: result.provider, id: result.id });
}
