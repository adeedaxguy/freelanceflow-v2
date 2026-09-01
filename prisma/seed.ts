/**
 * FreelanceFlow Database Seed
 * Run: npx ts-node prisma/seed.ts  OR  npx prisma db seed
 *
 * Creates the default admin account:
 *   Email:    admin@freelanceflow.io
 *   Password: Admin@FF2025!
 *
 * IMPORTANT: Change the admin password immediately after first login.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ─────────────────────────────────────────────────
  const adminEmail    = "admin@freelanceflow.io";
  const adminPassword = "Admin@FF2025!";
  const adminHash     = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", suspended: false },
    create: {
      email:    adminEmail,
      name:     "FreelanceFlow Admin",
      password: adminHash,
      role:     "ADMIN",
      plan:     "agency",
    },
  });
  console.log(`✅ Admin: ${admin.email} (id: ${admin.id})`);

  // ── Default templates ───────────────────────────────────────────
  const templates = [
    {
      name:      "Web Developer — Direct Outreach",
      niche:     "web-development",
      isDefault: true,
      subject:   "Quick question about your web project",
      body:      `Hi {{company}} team,\n\nI came across your posting for {{jobTitle}} and I'd love to help.\n\nI'm a full-stack developer with experience in React, Next.js, and Node.js. I build fast, scalable web apps that solve real business problems — not just pretty interfaces.\n\nRecent win: Helped a SaaS client reduce page load time by 60%, leading to a 22% increase in conversions.\n\n{{bio}}\n\nI'd love to learn more about your project. Could we jump on a 15-minute call this week?\n\nBest,\n{{name}}`,
    },
    {
      name:      "Designer — Portfolio Introduction",
      niche:     "ui-ux-design",
      isDefault: true,
      subject:   "Helping {{company}} create experiences users love",
      body:      `Hi {{company}} team,\n\nI'm reaching out about your {{jobTitle}} posting — it's right in my wheelhouse.\n\nI'm a UI/UX designer who specialises in turning complex workflows into simple, intuitive interfaces. I work in Figma and have shipped products used by 100,000+ users.\n\n{{bio}}\n\nI'll keep this short — I think I can genuinely add value here. Worth a quick chat?\n\nBest,\n{{name}}`,
    },
    {
      name:      "Copywriter — Conversion Focus",
      niche:     "copywriting",
      isDefault: true,
      subject:   "Copy that actually converts for {{company}}",
      body:      `Hi there,\n\nI saw your ad for {{jobTitle}} and I had to reach out.\n\nI write copy that converts — landing pages, email sequences, and ads that make people take action. My clients have seen email open rates jump from 18% to 41% and landing page conversions improve by 3x.\n\n{{bio}}\n\nI'd love to show you some relevant samples. Would a quick email exchange work?\n\nBest,\n{{name}}`,
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: `seed-${t.niche}` },
      update: {},
      create: { id: `seed-${t.niche}`, ...t },
    });
    console.log(`✅ Template: ${t.name}`);
  }

  // ── Default platform settings ───────────────────────────────────
  const settings = [
    { key: "stripe_mode",         value: "test" },
    { key: "stripe_public_key",   value: "" },
    { key: "stripe_secret_key",   value: "" },
    { key: "stripe_webhook_secret", value: "" },
    { key: "pro_price_id",        value: "" },
    { key: "agency_price_id",     value: "" },
    { key: "lemonsqueezy_test_mode", value: "true" },
    { key: "lemonsqueezy_store_id", value: "" },
    { key: "lemonsqueezy_pro_monthly_variant_id", value: "" },
    { key: "lemonsqueezy_pro_annual_variant_id", value: "" },
    { key: "lemonsqueezy_agency_monthly_variant_id", value: "" },
    { key: "lemonsqueezy_agency_annual_variant_id", value: "" },
    { key: "groq_api_key",        value: process.env.GROQ_API_KEY ?? "" },
    { key: "resend_api_key",      value: process.env.RESEND_API_KEY ?? "" },
    { key: "resend_from_email",   value: process.env.RESEND_FROM_EMAIL ?? "hello@freelanceflow.io" },
    { key: "site_name",           value: "FreelanceFlow" },
    { key: "support_email",       value: "support@freelanceflow.io" },
    { key: "maintenance_mode",    value: "false" },
    { key: "free_leads_per_week", value: "20" },
    { key: "pro_leads_per_week",  value: "500" },
    { key: "agency_leads_per_week", value: "2000" },
    { key: "pro_price_monthly",   value: "10" },
    { key: "agency_price_monthly", value: "15" },
  ];

  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where:  { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ Platform settings initialized");

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("Admin login:");
  console.log(`  URL:      http://localhost:3000/auth`);
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("Admin panel: http://localhost:3000/admin");
  console.log("─────────────────────────────────────────");
  console.log("⚠️  Change the admin password after first login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
