import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/setup?token=ff-admin-setup
 *
 * ONE-CLICK FIX: Visit this URL in your browser while dev server is running.
 * 1. Creates / resets admin@icloseleads.com with password Admin@FF2025!
 * 2. Verifies the bcrypt hash roundtrips correctly
 *
 * Disable: set DISABLE_ADMIN_SETUP=true in .env
 */

export async function GET(req: NextRequest) {
  if (process.env.DISABLE_ADMIN_SETUP === "true") {
    return NextResponse.json({ error: "Setup disabled" }, { status: 403 });
  }

  const token      = req.nextUrl.searchParams.get("token");
  const SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN ?? "ff-admin-setup";

  if (!token || token !== SETUP_TOKEN) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem;background:#0a0a0a;color:#fff">
        <h2 style="color:#ef4444">Provide the token</h2>
        <p>Visit: <code style="color:#a78bfa">/api/admin/setup?token=ff-admin-setup</code></p>
      </body></html>`,
      { status: 403, headers: { "Content-Type": "text/html" } }
    );
  }

  const ADMIN_EMAIL    = "admin@icloseleads.com";
  const ADMIN_PASSWORD = "Admin@FF2025!";
  let adminResult = "";
  let hashOk = false;
  let overallOk = false;

  try {
    // Step 1: Create fresh hash
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Step 2: Verify hash before saving
    const selfCheck = await bcrypt.compare(ADMIN_PASSWORD, hashed);
    if (!selfCheck) throw new Error("bcrypt self-check failed — environment issue");

    // Step 3: Upsert admin via Prisma ORM
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { id: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { password: hashed, role: "ADMIN", plan: "agency", suspended: false, name: "iCloseLeads Admin" },
      });
      adminResult = `Updated existing admin account (id: ${existing.id})`;
    } else {
      const newUser = await prisma.user.create({
        data: {
          email:     ADMIN_EMAIL,
          name:      "iCloseLeads Admin",
          password:  hashed,
          role:      "ADMIN",
          plan:      "agency",
          suspended: false,
        },
        select: { id: true },
      });
      adminResult = `Created new admin account (id: ${newUser.id})`;
    }

    // Step 4: Verify the saved hash
    const saved = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { password: true, role: true, suspended: true },
    });

    if (saved?.password) {
      hashOk = await bcrypt.compare(ADMIN_PASSWORD, saved.password);
    }

    overallOk = hashOk && saved?.role === "ADMIN" && !saved?.suspended;

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem;background:#0a0a0a;color:#fff">
        <h2 style="color:#ef4444">Setup Failed</h2>
        <pre style="color:#f87171;background:#111;padding:1rem;border-radius:8px;white-space:pre-wrap">${msg}</pre>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Admin Setup - iCloseLeads</title>
      <meta charset="utf-8">
    </head>
    <body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:3rem auto;padding:2rem;background:#0a0a0a;color:#fff;border-radius:16px;border:1px solid #222">

      <div style="text-align:center;margin-bottom:2rem">
        <h1 style="color:#a78bfa;margin:0.5rem 0">${overallOk ? "Setup Complete!" : "Setup Ran - Check Details"}</h1>
        <p style="color:#666;margin:0">iCloseLeads Admin Setup</p>
      </div>

      <div style="background:#111;border:1px solid #333;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem">
        <p style="margin:0 0 1rem;color:#888;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Admin Credentials</p>
        <table style="width:100%;font-size:0.95rem">
          <tr><td style="color:#888;padding:0.4rem 0;width:100px">Email</td>
              <td style="font-family:monospace;color:#fff">admin@icloseleads.com</td></tr>
          <tr><td style="color:#888;padding:0.4rem 0">Password</td>
              <td style="font-family:monospace;color:#a78bfa;font-size:1.1rem;font-weight:700">Admin@FF2025!</td></tr>
          <tr><td style="color:#888;padding:0.4rem 0">Status</td>
              <td style="color:${overallOk ? "#4ade80" : "#f87171"}">${overallOk ? "Ready to login" : "Check hash below"}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:1.5rem">
        <a href="/admin/login" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6366f1);color:#fff;padding:1rem 3rem;border-radius:12px;text-decoration:none;font-weight:700;font-size:1.1rem">
          Sign In to Admin Panel
        </a>
      </div>

      <details>
        <summary style="cursor:pointer;color:#888;font-size:0.85rem;padding:0.5rem 0">Admin Account Result</summary>
        <pre style="background:#111;border:1px solid #333;border-radius:8px;padding:1rem;font-size:0.75rem;color:#aaa;margin-top:0.5rem">${adminResult}
Hash verified: ${hashOk ? "YES" : "FAILED"}</pre>
      </details>

      <div style="margin-top:1.5rem;background:#1a0a0a;border:1px solid #ef444433;border-radius:8px;padding:0.75rem 1rem;font-size:0.78rem;color:#ef4444">
        <strong>Security:</strong> After logging in, add <code>DISABLE_ADMIN_SETUP=true</code> to <code>.env</code>
      </div>
    </body>
    </html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
