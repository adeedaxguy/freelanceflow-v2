import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { aggregateLeadsWithDiagnostics } from "@/lib/leads-aggregator";
import { searchLocalBusinesses } from "@/lib/local-leads-engine";
import { authorizeGrowthOs, growthOsHeaders } from "@/lib/growth-os-service";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  source: z.enum(["remote", "local", "saved"]).default("remote"),
  niches: z.string().max(500).default("web-development,ecommerce,shopify"),
  maxHours: z.coerce.number().int().min(1).max(720).default(168),
  minConfidence: z.coerce.number().int().min(0).max(100).default(55),
  keyword: z.string().trim().min(1).max(100).optional(),
  location: z.string().trim().min(1).max(150).optional(),
  filter: z.enum(["all", "no_website", "outdated_website", "has_website"]).default("all"),
  limit: z.coerce.number().int().min(1).max(50).default(50),
  cursor: z.string().regex(/^\d+$/).default("0"),
});

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: growthOsHeaders });
}

export async function GET(request: NextRequest) {
  const auth = authorizeGrowthOs(request);
  if (!auth.ok) return response({ error: auth.error }, auth.status);
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return response({ error: "Invalid query.", details: parsed.error.flatten() }, 400);

  const input = parsed.data;
  try {
    if (input.source === "saved") return savedSignals(input.limit, Number(input.cursor));
    if (input.source === "local") {
      if (!input.keyword || !input.location) return response({ error: "Local signals require keyword and location." }, 400);
      return localSignals(input.keyword, input.location, input.filter, input.limit);
    }
    return remoteSignals(input.niches, input.maxHours, input.minConfidence, input.limit);
  } catch (error) {
    console.error("[growth-os/signals]", error);
    return response({ error: "The lead source is temporarily unavailable." }, 502);
  }
}

async function remoteSignals(nicheInput: string, maxHours: number, minConfidence: number, limit: number) {
  const niches = nicheInput.split(",").map((value) => value.trim()).filter(Boolean).slice(0, 10);
  const { leads, diagnostics } = await aggregateLeadsWithDiagnostics(niches.length ? niches : ["web-development"], { maxHours, minConfidence, freshOnly: true });
  const signals = leads.slice(0, limit).map((lead) => ({
    id: `remote:${lead.source}:${lead.id}`,
    type: "REMOTE_BUYING_SIGNAL",
    title: `${lead.company}: ${lead.title}`,
    summary: `${lead.description.slice(0, 700)}${lead.budget ? ` Budget signal: ${lead.budget}.` : ""}`,
    confidence: Math.max(lead.confidence, lead.qualityScore),
    observedAt: lead.postedAt,
    sourceUrl: lead.url,
    companyName: lead.company,
    companyDomain: lead.domain || null,
    contactEmail: lead.email || null,
    contactVerification: "UNVERIFIED",
    niche: lead.niche,
    urgency: Boolean(lead.urgency),
    provenance: { source: lead.source, sourceLabel: lead.sourceLabel, capturedAt: new Date().toISOString() },
  }));
  return response({ signals, nextCursor: null, diagnostics: { source: "remote", ...diagnostics, returned: signals.length } });
}

async function localSignals(keyword: string, location: string, filter: "all" | "no_website" | "outdated_website" | "has_website", limit: number) {
  const result = await searchLocalBusinesses({
    keyword, location, filter, limit, userId: "growth-os-service", db: prisma,
    groqKey: process.env.GROQ_API_KEY,
    yelpKey: process.env.YELP_API_KEY,
    hereKey: process.env.HERE_API_KEY,
    foursquareKey: process.env.FOURSQUARE_API_KEY,
    tomtomKey: process.env.TOMTOM_API_KEY,
    geoapifyKey: process.env.GEOAPIFY_API_KEY,
    radarKey: process.env.RADAR_SECRET_KEY,
    bingKey: process.env.BING_MAPS_KEY,
    companiesHouseKey: process.env.COMPANIES_HOUSE_KEY,
    abnGuid: process.env.ABR_GUID,
    cacheScope: "growth-os-service",
  });
  const realLeads = result.leads.filter((lead) => lead.source !== "demo").slice(0, limit);
  const signals = realLeads.map((lead) => ({
    id: `local:${lead.source}:${lead.id}`,
    type: "LOCAL_BUSINESS_GAP",
    title: `${lead.name}: ${lead.opportunityType.replaceAll("_", " ")}`,
    summary: `${lead.pitchPoints.join(" ").slice(0, 700)} Website status: ${lead.websiteStatus}.`,
    confidence: lead.score,
    observedAt: new Date().toISOString(),
    sourceUrl: lead.website || lead.mapsUrl,
    companyName: lead.name,
    companyDomain: lead.website ? new URL(lead.website).hostname.replace(/^www\./, "") : null,
    contactEmail: lead.email || null,
    contactVerification: "UNVERIFIED",
    location: { city: lead.city, country: lead.country },
    provenance: { source: lead.source, capturedAt: new Date().toISOString(), sources: result.sources },
  }));
  return response({ signals, nextCursor: null, diagnostics: { source: "local", returned: signals.length, excludedDemoRows: result.leads.length - realLeads.length, sources: result.sources } });
}

async function savedSignals(limit: number, cursor: number) {
  const ownerEmail = process.env.GROWTH_OS_SOURCE_USER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) return response({ error: "GROWTH_OS_SOURCE_USER_EMAIL is required for saved-lead access." }, 503);
  const owner = await prisma.user.findUnique({ where: { email: ownerEmail }, select: { id: true } });
  if (!owner) return response({ error: "Configured source owner was not found." }, 404);
  const leads = await prisma.lead.findMany({ where: { userId: owner.id }, orderBy: [{ savedAt: "desc" }, { id: "asc" }], skip: cursor, take: limit });
  const signals = leads.map((lead) => ({
    id: `saved:${lead.id}`,
    type: "SAVED_QUALIFIED_LEAD",
    title: `${lead.company}: ${lead.title || "saved business opportunity"}`,
    summary: lead.description || lead.notes || "Saved in iCloseLeads for operator research.",
    confidence: Math.max(lead.confidence || 0, lead.qualityScore || 0),
    observedAt: lead.savedAt.toISOString(),
    sourceUrl: lead.sourceUrl,
    companyName: lead.company,
    companyDomain: lead.domain || null,
    contactEmail: lead.email || null,
    contactVerification: "UNVERIFIED",
    niche: lead.niche,
    provenance: { source: lead.source || "saved", capturedAt: new Date().toISOString() },
  }));
  return response({ signals, nextCursor: leads.length === limit ? String(cursor + leads.length) : null, diagnostics: { source: "saved", returned: signals.length } });
}
