export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN")
    throw new Error("Forbidden — only ADMIN can broadcast");
  return session;
}

function cuid() {
  return "c" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json() as {
      subject: string;
      message: string;
      segment: "all" | "free" | "pro" | "agency";
    };
    const { subject, message, segment } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    // Get target users
    const where: Record<string, unknown> = { suspended: false };
    if (segment !== "all") where.plan = segment;

    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true },
    });

    // Log the broadcast as admin action (non-fatal — AuditLog table may not exist)
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AuditLog" (id, "adminId", "adminEmail", action, "targetType", "targetId", details, "createdAt") VALUES ($1, $2, $3, 'broadcast', 'User', 'all', $4, NOW())`,
        cuid(), session.user.id, session.user.email ?? "", JSON.stringify({ subject, segment, recipientCount: users.length })
      );
    } catch { /* non-fatal */ }

    // In production you'd use Resend/SendGrid here.
    // For now we log the broadcast and return recipient count.
    return NextResponse.json({
      success: true,
      recipientCount: users.length,
      segment,
      note: "Broadcast logged. Connect Resend to deliver emails.",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
