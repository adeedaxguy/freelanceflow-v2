import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

/**
 * Emergency admin password reset.
 * POST /api/admin/reset  { "secret": "ff-reset-2025", "password": "YourNewPassword" }
 * Remove this file once you have logged in successfully.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { secret?: string; password?: string };
    const RESET_SECRET = process.env.ADMIN_RESET_SECRET ?? "ff-reset-2025";

    if (body.secret !== RESET_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    const newPassword = (body.password && body.password.length >= 8)
      ? body.password
      : "Admin@FF2025!";

    const hashed = await bcrypt.hash(newPassword, 12);

    // Update all existing ADMIN users — password + rebrand name/email
    await prisma.user.updateMany({
      where: { role: "ADMIN" },
      data: { password: hashed, name: "iCloseLeads Admin" },
    });

    // Also rename any leftover FreelanceFlow admin accounts
    await prisma.user.updateMany({
      where: { email: "admin@freelanceflow.io" },
      data:  { email: "admin@icloseleads.com", name: "iCloseLeads Admin", role: "ADMIN", plan: "agency" },
    }).catch(() => {/* ignore if old email not found */});

    // Ensure canonical admin account exists
    const existing = await prisma.user.findUnique({ where: { email: "admin@icloseleads.com" } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: "admin@icloseleads.com",
          name:  "iCloseLeads Admin",
          password: hashed,
          role: "ADMIN",
          plan: "agency",
        },
      });
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    return NextResponse.json({
      success: true,
      reset:   admins.map(a => a.email),
      password: newPassword,
      loginUrl: "/auth",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Reset failed", detail: msg }, { status: 500 });
  }
}
