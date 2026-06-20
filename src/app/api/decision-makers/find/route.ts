export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findDecisionMakers } from "@/lib/decision-maker-finder";

const UNLIMITED_EMAILS = new Set([
  "adeedaxguy@gmail.com",
  "adnan@technodigg.com",
  "adnanaimanager@gmail.com",
]);

const schema = z.object({
  company:  z.string().min(2).max(160).transform(s => s.trim()),
  country:  z.enum(["us", "uk"]).default("us"),
  domain:   z.string().max(240).optional().nullable().transform(v => v?.trim() || undefined),
  website:  z.string().max(300).optional().nullable().transform(v => v?.trim() || undefined),
  location: z.string().max(160).optional().nullable().transform(v => v?.trim() || undefined),
});

async function resolvePlan(userId: string, sessionPlan?: string | null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });
    const email = (user?.email ?? "").toLowerCase();
    if (UNLIMITED_EMAILS.has(email)) return "agency";
    return (user?.plan ?? sessionPlan ?? "free").toLowerCase();
  } catch {
    return (sessionPlan ?? "free").toLowerCase();
  }
}

async function loadCompaniesHouseKey() {
  let key = process.env.COMPANIES_HOUSE_API_KEY ?? process.env.COMPANIES_HOUSE_KEY ?? "";
  try {
    const setting = await prisma.platformSetting.findFirst({
      where: { key: { in: ["companies_house_key", "companies_house_api_key"] } },
      orderBy: { updatedAt: "desc" },
    });
    if (setting?.value && setting.value.length > 10) key = setting.value;
  } catch {
    // Non-fatal. The finder will still run website evidence checks.
  }
  return key;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const plan = await resolvePlan(session.user.id, (session.user as { plan?: string }).plan);
  const canUseFinder = plan === "agency" || plan === "pro";
  if (!canUseFinder) {
    return NextResponse.json({
      error: "Decision Maker Finder is an Agency preview. Free accounts will see this tab as coming soon.",
      requiresAgency: true,
      plan,
    }, { status: 403 });
  }

  try {
    const companiesHouseKey = await loadCompaniesHouseKey();
    const result = await findDecisionMakers({
      ...parsed.data,
      companiesHouseKey: companiesHouseKey || undefined,
    });
    return NextResponse.json({ result, plan });
  } catch (err) {
    console.error("[decision-makers/find]", err);
    return NextResponse.json({
      error: "Decision maker lookup is temporarily unavailable. Please try again in a moment.",
    }, { status: 500 });
  }
}
