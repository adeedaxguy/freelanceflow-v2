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
  country:  z.enum(["us", "uk", "ca", "au", "nz", "ie"]).default("us"),
  domain:   z.string().max(240).optional().nullable().transform(v => v?.trim() || undefined),
  website:  z.string().max(300).optional().nullable().transform(v => v?.trim() || undefined),
  location: z.string().max(160).optional().nullable().transform(v => v?.trim() || undefined),
  hunterKey: z.string().max(240).optional().nullable().transform(v => v?.trim() || undefined),
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

async function loadDecisionSourceKeys() {
  const keys = {
    companiesHouseKey: process.env.COMPANIES_HOUSE_API_KEY ?? process.env.COMPANIES_HOUSE_KEY ?? "",
    hunterKey: process.env.HUNTER_API_KEY ?? "",
    openCorporatesKey: process.env.OPENCORPORATES_API_KEY ?? process.env.OPENCORPORATES_API_TOKEN ?? "",
  };
  try {
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: {
          in: [
            "companies_house_key",
            "companies_house_api_key",
            "hunter_api_key",
            "opencorporates_api_key",
            "opencorporates_api_token",
          ],
        },
      },
    });
    for (const setting of settings) {
      if (!setting.value || setting.value.length <= 10) continue;
      if (setting.key === "companies_house_key" || setting.key === "companies_house_api_key") {
        keys.companiesHouseKey = setting.value;
      }
      if (setting.key === "hunter_api_key") {
        keys.hunterKey = setting.value;
      }
      if (setting.key === "opencorporates_api_key" || setting.key === "opencorporates_api_token") {
        keys.openCorporatesKey = setting.value;
      }
    }
  } catch {
    // Non-fatal. The finder will still run no-key public checks.
  }
  return keys;
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
    const sourceKeys = await loadDecisionSourceKeys();
    const result = await findDecisionMakers({
      ...parsed.data,
      companiesHouseKey: sourceKeys.companiesHouseKey || undefined,
      hunterKey: parsed.data.hunterKey || sourceKeys.hunterKey || undefined,
      openCorporatesKey: sourceKeys.openCorporatesKey || undefined,
    });
    return NextResponse.json({ result, plan });
  } catch (err) {
    console.error("[decision-makers/find]", err);
    return NextResponse.json({
      error: "Decision maker lookup is temporarily unavailable. Please try again in a moment.",
    }, { status: 500 });
  }
}
