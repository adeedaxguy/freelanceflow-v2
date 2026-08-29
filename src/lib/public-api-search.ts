import { z } from "zod";
import { aggregateLeadsWithDiagnostics, type AggregatedLead } from "@/lib/leads-aggregator";
import { searchLocalBusinesses, type LocalBizLead } from "@/lib/local-leads-engine";
import { prisma } from "@/lib/prisma";

const queryBoolean = z.enum(["true", "false"]).transform(value => value === "true");

export const publicLocalSearchSchema = z.object({
  keyword: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(150),
  filter: z.enum(["all", "no_website", "outdated_website", "has_website"]).default("no_website"),
  limit: z.coerce.number().int().min(1).max(50).default(25),
  cursor: z.coerce.number().int().min(0).max(500).default(0),
});

export const publicJobSearchSchema = z.object({
  niches: z.string().trim().max(500).default("web-development").transform(value =>
    value.split(",").map(niche => niche.trim()).filter(Boolean).slice(0, 10)
  ).refine(value => value.length > 0, "At least one niche is required."),
  max_hours: z.coerce.number().int().min(1).max(720).optional(),
  min_confidence: z.coerce.number().int().min(0).max(100).default(45),
  keyword: z.string().trim().max(100).optional(),
  has_email: queryBoolean.default("false"),
  urgent_only: queryBoolean.default("false"),
  limit: z.coerce.number().int().min(1).max(50).default(25),
  cursor: z.coerce.number().int().min(0).max(500).default(0),
});

type LocalSearch = z.infer<typeof publicLocalSearchSchema>;
type JobSearch = z.infer<typeof publicJobSearchSchema>;

type PlatformKeys = {
  groqKey?: string;
  yelpKey?: string;
  hereKey?: string;
  foursquareKey?: string;
  tomtomKey?: string;
  geoapifyKey?: string;
  radarKey?: string;
  bingKey?: string;
  companiesHouseKey?: string;
  abnGuid?: string;
};

const SETTING_ENV: Record<string, keyof PlatformKeys> = {
  groq_api_key: "groqKey",
  yelp_api_key: "yelpKey",
  here_api_key: "hereKey",
  foursquare_api_key: "foursquareKey",
  tomtom_api_key: "tomtomKey",
  geoapify_api_key: "geoapifyKey",
  radar_api_key: "radarKey",
  bing_maps_key: "bingKey",
  companies_house_key: "companiesHouseKey",
};

async function loadPlatformKeys(): Promise<PlatformKeys> {
  const keys: PlatformKeys = {
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
  };

  const settings = await prisma.platformSetting.findMany({
    where: { key: { in: Object.keys(SETTING_ENV) } },
    select: { key: true, value: true },
  }).catch(() => []);
  for (const setting of settings) {
    const field = SETTING_ENV[setting.key];
    if (field && setting.value?.length > 10) keys[field] = setting.value;
  }
  return keys;
}

function page<T>(items: T[], cursor: number, limit: number) {
  const data = items.slice(cursor, cursor + limit);
  const nextCursor = cursor + data.length < items.length ? cursor + data.length : null;
  return {
    data,
    pagination: {
      count: data.length,
      total: items.length,
      next_cursor: nextCursor,
      has_more: nextCursor !== null,
    },
  };
}

function publicLocalLead(lead: LocalBizLead) {
  return {
    id: lead.id,
    source: "icloseleads",
    name: lead.name,
    category: lead.categoryLabel || lead.category,
    address: lead.address,
    city: lead.city,
    country: lead.country,
    phone: lead.phone ?? null,
    email: lead.email ?? null,
    website: lead.website ?? null,
    website_status: lead.websiteStatus,
    maps_url: lead.mapsUrl,
    rating: lead.rating ?? null,
    review_count: lead.reviewCount ?? null,
    opportunity_type: lead.opportunityType,
    score: lead.score,
    urgency: lead.urgency,
    business_scale: lead.businessScale ?? "unknown",
    revenue_estimate: lead.revenueEst ?? null,
    pitch: {
      subject: lead.pitchSubject,
      opener: lead.pitchOpener,
      talking_points: lead.pitchPoints,
      call_script: lead.callScript,
    },
  };
}

function publicJob(lead: AggregatedLead) {
  return {
    id: lead.id,
    source: "icloseleads",
    title: lead.title,
    company: lead.company,
    domain: lead.domain || null,
    email: lead.email ?? null,
    description: lead.description,
    url: lead.url,
    posted_at: lead.postedAt,
    hours_ago: lead.hoursAgo,
    niche: lead.niche,
    tags: lead.tags,
    confidence: lead.confidence,
    quality_score: lead.qualityScore,
    budget: lead.budget ?? null,
    urgent: lead.urgency ?? false,
  };
}

export async function findPublicLocalBusinesses(input: LocalSearch, userId: string) {
  const keys = await loadPlatformKeys();
  const result = await searchLocalBusinesses({
    keyword: input.keyword,
    location: input.location,
    filter: input.filter,
    limit: Math.min(80, input.cursor + input.limit),
    userId,
    ...keys,
    cacheScope: "public-api",
    db: prisma,
  });
  const realLeads = result.leads.map(publicLocalLead);
  return {
    ...page(realLeads, input.cursor, input.limit),
    meta: {
      keyword: input.keyword,
      location: input.location,
      filter: input.filter,
      geocoded: result.geocoded,
      requested_at: new Date().toISOString(),
    },
  };
}

export async function findPublicJobs(kind: "remote" | "live", input: JobSearch) {
  const maxHours = input.max_hours ?? (kind === "live" ? 24 : 168);
  const { leads } = await aggregateLeadsWithDiagnostics(input.niches, {
    maxHours,
    minConfidence: input.min_confidence,
    freshOnly: kind === "live",
  });

  const keyword = input.keyword?.toLowerCase();
  const filtered = leads.filter(lead => {
    if (input.has_email && !lead.email) return false;
    if (input.urgent_only && !lead.urgency) return false;
    if (!keyword) return true;
    return [lead.title, lead.company, lead.description, ...lead.tags]
      .some(value => value.toLowerCase().includes(keyword));
  }).map(publicJob);

  return {
    ...page(filtered, input.cursor, input.limit),
    meta: {
      kind,
      niches: input.niches,
      max_hours: maxHours,
      min_confidence: input.min_confidence,
      requested_at: new Date().toISOString(),
    },
  };
}
