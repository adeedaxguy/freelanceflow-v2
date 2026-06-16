export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { searchLocalBusinesses, checkRateLimit, type LocalBizLead } from "@/lib/local-leads-engine";

// Re-export the type so the dashboard page can import it from this route
export type { LocalBizLead as LocalLead };

const schema = z.object({
  keyword:  z.string().min(1).max(100).transform(s => s.trim()),
  location: z.string().min(1).max(150).transform(s => s.trim()),
  filter:   z.enum(["all","no_website","outdated_website","has_website"]).optional().default("no_website"),
  limit:    z.number().int().min(1).max(80).optional().default(50),
});

export async function POST(req: NextRequest) {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 unique searches per user per hour (cached hits don't count)
  if (!checkRateLimit(session.user.id, 20)) {
    return NextResponse.json({
      error: "Rate limit reached — you can run up to 20 searches per hour. Results are cached for 24 hours.",
    }, { status: 429 });
  }

  // Validate input
  const body = await req.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }
  const { keyword, location, filter, limit } = parsed.data;

  const userPlan = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  }).then(user => user?.plan ?? (session.user as { plan?: string }).plan ?? "free").catch(() => "free");
  const isAgencyPlan = userPlan === "agency";

  // Load API keys — env vars first, then per-user DB settings
  let groqKey           = process.env.GROQ_API_KEY            ?? "";
  let yelpKey           = process.env.YELP_API_KEY            ?? "";
  let hereKey           = process.env.HERE_API_KEY            ?? "";
  let platformFoursquareKey = isAgencyPlan ? process.env.FOURSQUARE_API_KEY ?? "" : "";
  let tomtomKey         = process.env.TOMTOM_API_KEY          ?? "";
  let geoapifyKey       = process.env.GEOAPIFY_API_KEY        ?? "";
  let radarKey          = process.env.RADAR_SECRET_KEY        ?? "";
  let bingKey           = process.env.BING_MAPS_KEY           ?? "";
  let companiesHouseKey = process.env.COMPANIES_HOUSE_KEY     ?? "";
  const abnGuid         = process.env.ABR_GUID               ?? "";

  // Accept user-provided keys from request body (set via Settings → Integrations)
  const bodyRaw = body as Record<string, unknown>;
  const pick = (k: string, cur: string) =>
    typeof bodyRaw[k] === "string" && (bodyRaw[k] as string).length > 10 ? bodyRaw[k] as string : cur;
  yelpKey       = pick("yelpKey",           yelpKey);
  const userFoursquareKey = pick("foursquareKey", "");
  tomtomKey     = pick("tomtomKey",         tomtomKey);
  geoapifyKey   = pick("geoapifyKey",       geoapifyKey);
  radarKey      = pick("radarKey",          radarKey);
  bingKey       = pick("bingKey",           bingKey);

  const ALL_SETTING_KEYS = [
    "groq_api_key","yelp_api_key","here_api_key","foursquare_api_key",
    "tomtom_api_key","geoapify_api_key","radar_api_key","bing_maps_key","companies_house_key",
  ];
  try {
    const settings = await prisma.platformSetting.findMany({
      where: { key: { in: ALL_SETTING_KEYS } },
    }).catch(() => []);
    for (const s of settings) {
      if (!s.value || s.value.length <= 10) continue;
      if (s.key === "groq_api_key")        groqKey           = s.value;
      if (s.key === "yelp_api_key")        yelpKey           = s.value;
      if (s.key === "here_api_key")        hereKey           = s.value;
      if (s.key === "foursquare_api_key" && isAgencyPlan) platformFoursquareKey = s.value;
      if (s.key === "tomtom_api_key")      tomtomKey         = s.value;
      if (s.key === "geoapify_api_key")    geoapifyKey       = s.value;
      if (s.key === "radar_api_key")       radarKey          = s.value;
      if (s.key === "bing_maps_key")       bingKey           = s.value;
      if (s.key === "companies_house_key") companiesHouseKey = s.value;
    }
  } catch { /* non-fatal */ }

  const foursquareKey = userFoursquareKey || platformFoursquareKey;
  const cacheScope = isAgencyPlan && !userFoursquareKey && platformFoursquareKey
    ? "agency-foursquare"
    : undefined;

  // Run the multi-source search engine
  let result;
  try {
    result = await searchLocalBusinesses({
      keyword, location, filter, limit,
      userId:            session.user.id,
      groqKey:           groqKey           || undefined,
      yelpKey:           yelpKey           || undefined,
      hereKey:           hereKey           || undefined,
      foursquareKey:     foursquareKey     || undefined,
      tomtomKey:         tomtomKey         || undefined,
      geoapifyKey:       geoapifyKey       || undefined,
      radarKey:          radarKey          || undefined,
      bingKey:           bingKey           || undefined,
      companiesHouseKey: companiesHouseKey || undefined,
      abnGuid:           abnGuid           || undefined,
      cacheScope,
      db:                prisma,
    });
  } catch (err) {
    console.error("[local-leads/search]", err);
    return NextResponse.json(
      { error: "Search temporarily unavailable. Please try again in a moment.", geocoded: false, results: [], total: 0, sources: [] },
      { status: 500 }
    );
  }

  return NextResponse.json({
    results:  result.leads,
    source:   result.source,
    sources:  result.sources,
    total:    result.total,
    geocoded: result.geocoded,
    keyword,
    location,
    filter,
    cached:   result.source === "cache",
  });
}
