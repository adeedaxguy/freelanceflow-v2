"use client";

import { Fragment, useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  MapPin, Search, Globe, Phone, PhoneCall, Star, ExternalLink, Bookmark,
  CheckCircle, Sparkles, ChevronDown, ChevronUp, AlertCircle,
  X, Copy, Target, Lightbulb, Mail, Building2,
  Zap, Info, Clock, Wifi, WifiOff, RefreshCw, DollarSign,
  Flame, Activity, ChevronLeft, ChevronRight,
  Filter, Users, Store, Palette, Download,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BonusLeadsModal from "@/components/BonusLeadsModal";
import type { LocalLead } from "@/app/api/local-leads/search/route";
import { getPhoneTypeInfo, getPhoneTypeTone, type PhoneLineType } from "@/lib/phone-type";
import { copyText } from "@/lib/clipboard";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { LeadResultsAd } from "@/components/AdSenseUnit";

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE       = 10;
const FREE_PLAN_LIMIT      = 100;          // 100 leads per 24 hours
const LOCAL_YELP_KEY_KEY   = "ff_yelp_api_key";
const SS_LOCAL_KEY         = "ff_ss_local_results";
const LOCAL_FSQ_KEY_KEY    = "ff_foursquare_api_key";
const LOCAL_SEARCH_TIMEOUT_MS = 45_000;

type LocalLeadsCache = {
  results?: LocalLead[];
  keyword?: string;
  location?: string;
  filter?: "all"|"no_website"|"outdated_website"|"has_website";
  hasPhone?: boolean;
  smallOperatorOnly?: boolean;
  phoneTypeFilter?: PhoneTypeFilter;
  minRating?: number;
  page?: number;
  meta?: { source?: string; geocoded?: boolean; cached?: boolean; sources?: string[] } | null;
  savedIds?: string[];
};

type PhoneTypeFilter = "all" | "mobile" | "landline" | "toll_free_service" | "business_unknown";

type UsageStats = {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  nextReset: string;
  percentage: number;
  unlimited?: boolean;
  bonusLeads?: number;
  shareBonusClaimed?: boolean;
};

const PHONE_TYPE_FILTERS: Array<{ value: PhoneTypeFilter; label: string; title: string }> = [
  { value: "all", label: "Any type", title: "Show all leads regardless of number type." },
  { value: "mobile", label: "Mobile / WhatsApp likely", title: "Shows numbers with mobile prefixes. WhatsApp availability still needs confirmation." },
  { value: "landline", label: "Landline", title: "Shows numbers that look like fixed business landlines." },
  { value: "toll_free_service", label: "Toll-free / Service", title: "Shows toll-free, freephone, or service-rate business numbers." },
  { value: "business_unknown", label: "Business / Unknown", title: "Shows business numbers where mobile vs landline cannot be verified from the digits alone." },
];

const PHONE_TYPE_COUNT_ZERO: Record<PhoneTypeFilter, number> = {
  all: 0,
  mobile: 0,
  landline: 0,
  toll_free_service: 0,
  business_unknown: 0,
};

function phoneLineTypeMatchesFilter(type: PhoneLineType, phoneTypeFilter: PhoneTypeFilter) {
  if (phoneTypeFilter === "all") return true;
  if (phoneTypeFilter === "toll_free_service") return type === "toll_free" || type === "service";
  if (phoneTypeFilter === "business_unknown") return type === "business" || type === "unknown";
  return type === phoneTypeFilter;
}

function matchesPhoneTypeFilter(lead: LocalLead, phoneTypeFilter: PhoneTypeFilter) {
  if (phoneTypeFilter === "all") return true;
  if (!lead.phone) return false;
  const info = getPhoneTypeInfo(lead.phone, lead.country);
  return phoneLineTypeMatchesFilter(info.type, phoneTypeFilter);
}

const SMALL_OPERATOR_CATEGORY_RE =
  /\b(clean(?:ing|er)?|handyman|plumb(?:er|ing)?|electric(?:ian|al)?|roofer|roofing|painter|decorator|landscap(?:er|ing)?|lawn|gardener|barber|salon|nail|massage|spa|photograph(?:er|y)?|florist|bakery|cafe|coffee|catering|food truck|takeaway|restaurant|repair|detailing|car wash|locksmith|tutor|pet groom(?:er|ing)?|tailor|alteration|kiosk|stall|cart|market|pos)\b/i;
const SMALL_OPERATOR_NAME_RE =
  /\b(mobile|truck|cart|stall|kiosk|booth|pop[- ]?up|market|family|owner|independent|studio|local|artisan|handmade|street|home|van|caravan|trailer|solo)\b/i;
const SMALL_OPERATOR_ADDRESS_RE =
  /\b(stall|booth|kiosk|unit|suite|market|mall|plaza|van|trailer|caravan)\b/i;
const LARGE_BUSINESS_NAME_RE =
  /\b(walmart|mcdonald'?s|starbucks|subway|burger king|kfc|domino'?s|target|costco|tesco|sainsbury'?s|asda|aldi|lidl|cvs|walgreens|home depot|lowe'?s|best buy|dunkin'?|wendy'?s|chipotle|popeyes|taco bell|panda express|pizza hut|7-eleven|holdings|group|corporation|enterprise|international|global|national|franchise)\b/i;

function getSmallOperatorSignal(lead: LocalLead) {
  const serverScale = lead.businessScale;
  if (serverScale && typeof lead.businessScaleScore === "number") {
    return {
      matches: serverScale === "micro" || serverScale === "small",
      label: serverScale === "micro" ? "Micro operator" : "Small operator",
      score: lead.businessScaleScore,
      reasons: lead.businessScaleReasons?.length ? lead.businessScaleReasons : ["public profile looks smaller than a chain"],
    };
  }

  const name = lead.name ?? "";
  const category = `${lead.category ?? ""} ${lead.categoryLabel ?? ""}`;
  const address = lead.address ?? "";
  const combined = `${name} ${category} ${address}`;
  let score = 22;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    if (points > 0 && !reasons.includes(reason)) reasons.push(reason);
  };

  if (SMALL_OPERATOR_CATEGORY_RE.test(category)) add(18, "local service or storefront category");
  if (SMALL_OPERATOR_NAME_RE.test(name)) add(16, "owner-run or mobile naming signal");
  if (SMALL_OPERATOR_ADDRESS_RE.test(address)) add(10, "small premises, stall, or mobile address clue");
  if (lead.websiteStatus === "none" || lead.websiteStatus === "unknown") add(12, "weak or missing website signal");
  if (lead.websiteStatus === "outdated" || lead.websiteStatus === "unreachable") add(8, "website needs attention");
  if (lead.phone) add(4, "direct public phone route found");

  if (typeof lead.reviewCount === "number") {
    if (lead.reviewCount <= 25) add(20, "low public review footprint");
    else if (lead.reviewCount <= 75) add(14, "modest public review footprint");
    else if (lead.reviewCount <= 150) add(7, "single-location sized review footprint");
    else if (lead.reviewCount >= 1000) score -= 35;
    else if (lead.reviewCount >= 500) score -= 22;
  } else {
    add(6, "limited public profile data");
  }

  if (LARGE_BUSINESS_NAME_RE.test(combined)) score -= 40;
  score = Math.max(0, Math.min(100, score));

  return {
    matches: score >= 40,
    label: score >= 58 ? "Micro operator" : "Small operator",
    score,
    reasons: reasons.length ? reasons.slice(0, 4) : ["public profile looks smaller than a chain"],
  };
}

function smallOperatorTitle(lead: LocalLead) {
  const signal = getSmallOperatorSignal(lead);
  return `${signal.label} signal (${signal.score}/100): ${signal.reasons.join(" · ")}. Use as a prospecting clue, then verify before pitching.`;
}

function decisionMakerCountryParam(country?: string) {
  const value = (country ?? "").toLowerCase();
  if (/\b(uk|gb|gbr|united kingdom|great britain|england|scotland|wales|northern ireland)\b/.test(value)) return "uk";
  if (/\b(us|usa|united states|united states of america)\b/.test(value)) return "us";
  if (/\b(ca|canada)\b/.test(value)) return "ca";
  if (/\b(au|australia)\b/.test(value)) return "au";
  if (/\b(nz|new zealand)\b/.test(value)) return "nz";
  if (/\b(ie|ireland)\b/.test(value)) return "ie";
  return "";
}

function decisionMakerLocation(lead: LocalLead, searchLocation?: string) {
  const address = lead.address && !/address not listed/i.test(lead.address) ? lead.address.trim() : "";
  const primary = address || lead.city?.trim() || "";
  const search = searchLocation?.trim() ?? "";
  if (!primary) return search;
  if (!search) return primary;

  const normalizedPrimary = primary.toLowerCase();
  const normalizedSearch = search.toLowerCase();
  if (normalizedPrimary.includes(normalizedSearch)) return primary;

  const [searchCity, ...regionParts] = search.split(",").map(part => part.trim()).filter(Boolean);
  const region = regionParts.join(", ");
  if (!region) return primary;
  if (normalizedPrimary.includes(region.toLowerCase())) return primary;
  if (searchCity && normalizedPrimary.includes(searchCity.toLowerCase())) return `${primary}, ${region}`;

  return `${primary}, ${search}`;
}

function googleMapsBusinessProfileUrl(lead: LocalLead) {
  const query = [lead.name, lead.address, lead.city, lead.country].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || lead.name)}`;
}

function csvCell(value: unknown) {
  const text = Array.isArray(value)
    ? value.filter(Boolean).join(" | ")
    : value == null
      ? ""
      : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function safeCsvSlug(value: string) {
  return (value || "local-leads")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "local-leads";
}

function exportLocalLeadsCsv(leads: LocalLead[], keyword: string, location: string, filters: string[]) {
  if (!leads.length) return;

  const headers = [
    "Business",
    "Category",
    "Address",
    "City",
    "Country",
    "Phone",
    "Phone Type",
    "Phone Type Confidence",
    "Website Status",
    "Website",
    "Rating",
    "Reviews",
    "Score",
    "Urgency",
    "Business Scale",
    "Revenue Estimate",
    "Google Maps",
    "Email",
    "Guessed Emails",
    "Pitch Subject",
    "Pitch Opener",
    "Pitch Points",
    "Search Keyword",
    "Search Location",
    "Active Filters",
    "Exported At",
  ];

  const exportedAt = new Date().toISOString();
  const rows = leads.map(lead => {
    const phoneInfo = getPhoneTypeInfo(lead.phone, lead.country);
    return [
      lead.name,
      lead.categoryLabel || lead.category,
      lead.address,
      lead.city,
      lead.country,
      lead.phone,
      phoneInfo.shortLabel,
      phoneInfo.confidence,
      lead.websiteStatus,
      lead.website,
      lead.rating,
      lead.reviewCount,
      lead.score,
      lead.urgency,
      lead.businessScale,
      lead.revenueEst,
      lead.mapsUrl || googleMapsBusinessProfileUrl(lead),
      lead.email,
      lead.guessedEmails,
      lead.pitchSubject,
      lead.pitchOpener,
      lead.pitchPoints,
      keyword,
      location,
      filters.length ? filters.join(" | ") : "None",
      exportedAt,
    ].map(csvCell).join(",");
  });

  const csv = [headers.map(csvCell).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeCsvSlug(keyword)}-${safeCsvSlug(location)}-local-leads.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function postLocalLeadSearch(body: Record<string, unknown>, retry = true): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), LOCAL_SEARCH_TIMEOUT_MS);

  try {
    return await fetch("/api/local-leads/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (retry) {
      await new Promise(resolve => window.setTimeout(resolve, 900));
      return postLocalLeadSearch(body, false);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function getLocalLeadCallScript(lead: LocalLead) {
  const existing = typeof lead.callScript === "string" ? lead.callScript.trim() : "";
  if (existing) return existing;

  const businessName = lead.name || "this business";
  const businessType = (lead.categoryLabel ?? lead.category ?? "local business").toLowerCase();

  if (lead.websiteStatus === "none" || lead.websiteStatus === "unknown" || lead.opportunityType === "no_website") {
    return `Hi, this is [Your name]. Is this the right person for ${businessName}'s website or marketing? I found you while checking local ${businessType} options and could not find a clear website on the business profile. That can make it harder for mobile searchers to see services, photos, and request a quote. I help fix that quickly. Can I send a short example?`;
  }

  if (lead.websiteStatus === "outdated" || lead.websiteStatus === "unreachable" || lead.opportunityType === "outdated_website") {
    return `Hi, this is [Your name]. Who handles the website for ${businessName}? I noticed the site may be dated or hard to reach on mobile. I help local ${businessType} businesses make quick fixes that turn visitors into calls, bookings, or quote requests. Would you be open to a short screen recording with the three fixes I would prioritize?`;
  }

  if (lead.opportunityType === "seo") {
    return `Hi, this is [Your name]. Is this the owner or manager for ${businessName}? I was checking local ${businessType} searches and saw a few ways you could show up stronger in Google and Maps, mainly clearer service pages, reviews, and conversion buttons. Can I send a quick local visibility checklist?`;
  }

  return `Hi, this is [Your name]. Who handles website enquiries for ${businessName}? I saw you already have an online presence, so this is not a basic website call. I noticed a few conversion improvements that could make it easier for visitors to call or request a quote. Can I send a quick mini-audit?`;
}

// 150+ keyword suggestions grouped by category
const KEYWORD_CATEGORIES: Record<string, string[]> = {
  "🔧 Trades & Construction": [
    "plumber","electrician","carpenter","roofer","painter","decorator","tiler",
    "glazier","plasterer","bricklayer","scaffolder","welder","joiner","fencer",
    "flooring","damp proofing","insulation","solar panel installer","window fitter",
    "kitchen fitter","bathroom fitter","loft conversion","extension builder",
  ],
  "🏡 Home Services": [
    "landscaper","gardener","tree surgeon","cleaning service","window cleaner",
    "carpet cleaner","pressure washing","handyman","locksmith","pest control",
    "hvac","heating engineer","boiler repair","air conditioning","chimney sweep",
    "gutter cleaning","ironing service","domestic cleaner","end of tenancy cleaning",
  ],
  "🚗 Automotive": [
    "mechanic","car repair","auto body shop","car wash","car detailing",
    "tyre fitting","mot centre","van repair","motorcycle repair","windscreen repair",
    "car dealership","car valeting","breakdown recovery",
  ],
  "🏥 Health & Medical": [
    "dentist","dental clinic","orthodontist","doctor","gp surgery","clinic",
    "pharmacy","optician","optometrist","physiotherapist","chiropractor","osteopath",
    "podiatrist","audiologist","private hospital","cosmetic surgeon","dermatologist",
    "nutritionist","personal trainer","gym","yoga studio","pilates",
  ],
  "🐾 Animals": [
    "vet","veterinarian","animal clinic","pet grooming","dog grooming","dog walker",
    "pet shop","pet boarding","horse trainer","kennels","cattery",
  ],
  "💇 Beauty & Wellness": [
    "hair salon","hairdresser","barber","nail salon","beauty salon","spa",
    "massage","waxing","tanning salon","tattoo studio","piercing",
    "eyebrow threading","eyelash extensions","makeup artist",
  ],
  "🍽️ Food & Hospitality": [
    "restaurant","cafe","coffee shop","bakery","pizza","takeaway","pub","bar",
    "hotel","bed and breakfast","guest house","catering","food truck",
    "wedding caterer","butcher","fishmonger","deli","ice cream shop",
  ],
  "📚 Education & Childcare": [
    "nursery","childcare","daycare","primary school","tutoring","music teacher",
    "driving school","language school","dance school","martial arts","swimming lessons",
    "art classes","cooking classes","coding school",
  ],
  "💼 Professional Services": [
    "accountant","bookkeeper","tax advisor","solicitor","lawyer","estate agent",
    "architect","surveyor","financial advisor","insurance broker","mortgage broker",
    "recruitment agency","hr consultant","business consultant","marketing agency",
    "graphic design studio","web design agency","it support","printing company",
  ],
  "🛍️ Retail & Shops": [
    "florist","jeweller","tailor","dry cleaner","laundry","shoe repair",
    "watch repair","electronics repair","phone repair","furniture store",
    "antique shop","gift shop","toy shop","bookshop","pharmacy","opticians",
  ],
  "📸 Creative": [
    "photographer","videographer","recording studio","art gallery","interior designer",
    "event planner","wedding photographer","event venue","party supplies",
  ],
  "🏗️ Storage & Logistics": [
    "self storage","removal company","courier","freight","logistics","warehousing",
  ],
};

const KEYWORD_SUGGESTIONS = Object.values(KEYWORD_CATEGORIES).flat();

// Worldwide city suggestions grouped by region
const LOCATION_GROUPS: Record<string, string[]> = {
  "🇬🇧 United Kingdom": [
    "London, UK","Manchester, UK","Birmingham, UK","Glasgow, UK","Leeds, UK",
    "Liverpool, UK","Sheffield, UK","Bristol, UK","Edinburgh, UK","Leicester, UK",
    "Cardiff, UK","Belfast, UK","Nottingham, UK","Newcastle, UK","Southampton, UK",
    "Brighton, UK","Oxford, UK","Cambridge, UK","Coventry, UK","Reading, UK",
  ],
  "🇺🇸 United States": [
    "New York, NY","Los Angeles, CA","Chicago, IL","Houston, TX","Phoenix, AZ",
    "Philadelphia, PA","San Antonio, TX","San Diego, CA","Dallas, TX","San Jose, CA",
    "Austin, TX","Jacksonville, FL","Fort Worth, TX","Columbus, OH","Charlotte, NC",
    "Indianapolis, IN","San Francisco, CA","Seattle, WA","Denver, CO","Boston, MA",
    "Nashville, TN","Las Vegas, NV","Portland, OR","Memphis, TN","Atlanta, GA",
    "Miami, FL","Minneapolis, MN","Tampa, FL","New Orleans, LA","Tucson, AZ",
  ],
  "🇨🇦 Canada": [
    "Toronto, Canada","Vancouver, Canada","Calgary, Canada","Montreal, Canada",
    "Edmonton, Canada","Ottawa, Canada","Winnipeg, Canada","Quebec City, Canada",
    "Hamilton, Canada","Kitchener, Canada","Halifax, Canada","London, Canada",
    "Victoria, Canada","Saskatoon, Canada","Regina, Canada",
  ],
  "🇦🇺 Australia": [
    "Sydney, Australia","Melbourne, Australia","Brisbane, Australia","Perth, Australia",
    "Adelaide, Australia","Gold Coast, Australia","Canberra, Australia",
    "Newcastle, Australia","Wollongong, Australia","Hobart, Australia",
    "Geelong, Australia","Townsville, Australia","Darwin, Australia",
  ],
  "🇳🇿 New Zealand": [
    "Auckland, New Zealand","Wellington, New Zealand","Christchurch, New Zealand",
    "Hamilton, New Zealand","Tauranga, New Zealand","Dunedin, New Zealand",
  ],
  "🇩🇪 Germany": [
    "Berlin, Germany","Hamburg, Germany","Munich, Germany","Cologne, Germany",
    "Frankfurt, Germany","Stuttgart, Germany","Düsseldorf, Germany","Leipzig, Germany",
    "Dortmund, Germany","Essen, Germany","Bremen, Germany","Dresden, Germany",
  ],
  "🇫🇷 France": [
    "Paris, France","Lyon, France","Marseille, France","Toulouse, France",
    "Nice, France","Nantes, France","Strasbourg, France","Bordeaux, France",
    "Montpellier, France","Rennes, France","Lille, France",
  ],
  "🇪🇸 Spain": [
    "Madrid, Spain","Barcelona, Spain","Valencia, Spain","Seville, Spain",
    "Zaragoza, Spain","Málaga, Spain","Murcia, Spain","Palma, Spain","Bilbao, Spain",
  ],
  "🇮🇹 Italy": [
    "Rome, Italy","Milan, Italy","Naples, Italy","Turin, Italy","Palermo, Italy",
    "Genoa, Italy","Bologna, Italy","Florence, Italy","Venice, Italy","Bari, Italy",
  ],
  "🇳🇱 Netherlands": [
    "Amsterdam, Netherlands","Rotterdam, Netherlands","The Hague, Netherlands",
    "Utrecht, Netherlands","Eindhoven, Netherlands","Groningen, Netherlands",
  ],
  "🇧🇪 Belgium": [
    "Brussels, Belgium","Antwerp, Belgium","Ghent, Belgium","Bruges, Belgium","Liège, Belgium",
  ],
  "🇵🇱 Poland": [
    "Warsaw, Poland","Kraków, Poland","Łódź, Poland","Wrocław, Poland","Poznań, Poland",
    "Gdańsk, Poland","Szczecin, Poland","Katowice, Poland",
  ],
  "🇵🇹 Portugal": [
    "Lisbon, Portugal","Porto, Portugal","Braga, Portugal","Coimbra, Portugal","Funchal, Portugal",
  ],
  "🇨🇭 Switzerland": [
    "Zurich, Switzerland","Geneva, Switzerland","Basel, Switzerland","Bern, Switzerland","Lausanne, Switzerland",
  ],
  "🇸🇪 Scandinavia": [
    "Stockholm, Sweden","Gothenburg, Sweden","Malmö, Sweden",
    "Oslo, Norway","Bergen, Norway","Trondheim, Norway",
    "Copenhagen, Denmark","Aarhus, Denmark",
    "Helsinki, Finland","Tampere, Finland","Espoo, Finland",
  ],
  "🇦🇪 Middle East": [
    "Dubai, UAE","Abu Dhabi, UAE","Sharjah, UAE",
    "Riyadh, Saudi Arabia","Jeddah, Saudi Arabia",
    "Doha, Qatar","Kuwait City, Kuwait","Muscat, Oman","Manama, Bahrain",
  ],
  "🇿🇦 Africa": [
    "Cape Town, South Africa","Johannesburg, South Africa","Durban, South Africa","Pretoria, South Africa",
    "Lagos, Nigeria","Nairobi, Kenya","Accra, Ghana","Cairo, Egypt","Casablanca, Morocco",
  ],
  "🇮🇳 India": [
    "Mumbai, India","Delhi, India","Bangalore, India","Hyderabad, India","Chennai, India",
    "Kolkata, India","Pune, India","Ahmedabad, India","Jaipur, India","Surat, India",
  ],
  "🌏 Asia Pacific": [
    "Singapore","Tokyo, Japan","Osaka, Japan","Seoul, South Korea","Busan, South Korea",
    "Hong Kong","Taipei, Taiwan","Bangkok, Thailand","Kuala Lumpur, Malaysia",
    "Jakarta, Indonesia","Manila, Philippines","Ho Chi Minh City, Vietnam","Hanoi, Vietnam",
  ],
  "🌎 Latin America": [
    "São Paulo, Brazil","Rio de Janeiro, Brazil","Buenos Aires, Argentina",
    "Santiago, Chile","Bogotá, Colombia","Lima, Peru","Mexico City, Mexico",
    "Guadalajara, Mexico","Monterrey, Mexico","Caracas, Venezuela",
  ],
};

const LOCATION_SUGGESTIONS = Object.values(LOCATION_GROUPS).flat();

// ─── Helper components ────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => void copyText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); })}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors ml-1"
    >
      {ok ? <CheckCircle className="w-3 h-3 text-accent"/> : <Copy className="w-3 h-3"/>}
      {ok ? "Copied!" : "Copy"}
    </button>
  );
}

function WebsiteBadge({ status, tech, age }: { status: LocalLead["websiteStatus"]; tech?: string; age?: string }) {
  if (status === "none") return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
      <WifiOff className="w-3 h-3"/> No Website (verified)
    </span>
  );
  if (status === "unknown") return (
    <span title="Website status has not been confirmed yet. Verify the business profile before pitching." className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border font-medium cursor-help">
      <AlertCircle className="w-3 h-3"/> Website unverified
    </span>
  );
  if (status === "unreachable") return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
      <AlertCircle className="w-3 h-3"/> Site Down
    </span>
  );
  if (status === "outdated") return (
    <span title={tech ?? age ?? ""} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium cursor-help">
      <Clock className="w-3 h-3"/> Outdated {tech ? `(${tech.split(" ").slice(0,2).join(" ")})` : age ? `(${age})` : ""}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
      <Wifi className="w-3 h-3"/> Live Website
    </span>
  );
}

function websiteStatusLabel(status: LocalLead["websiteStatus"]) {
  if (status === "none") return "No website";
  if (status === "unknown") return "Website unverified";
  if (status === "outdated") return "Outdated site";
  if (status === "unreachable") return "Site down";
  return "Has website";
}

function UrgencyBadge({ urgency }: { urgency: LocalLead["urgency"] }) {
  if (urgency === "high") return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 font-bold animate-pulse">
      <Flame className="w-3 h-3"/> Hot Lead
    </span>
  );
  if (urgency === "medium") return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
      <Activity className="w-3 h-3"/> Warm Lead
    </span>
  );
  return null;
}

function OpportunityBadge({ type }: { type: LocalLead["opportunityType"] }) {
  if (type === "no_website")       return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">New Website</span>;
  if (type === "outdated_website") return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">Redesign</span>;
  if (type === "modernise")        return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">Modernise</span>;
  return                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">SEO / Improve</span>;
}

// ─── Daily limit banner ───────────────────────────────────────────────────────
function DailyLimitBanner({ resetAt }: { resetAt: Date | null }) {
  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/8 to-primary/5 p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto">
        <Clock className="w-7 h-7 text-gold"/>
      </div>
      <div>
        <h3 className="text-foreground font-bold text-lg">You&apos;ve used today&apos;s free local leads</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto leading-relaxed">
          Free plan resets every 24 hours.
          {resetAt && (
            <> Your next leads unlock at <strong className="text-foreground">{resetAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>.</>
          )}
        </p>
      </div>
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold">
        <Sparkles className="w-4 h-4" /> Use the unlock option to add +300 free leads
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 transition-all"
        >
          <ChevronLeft className="w-4 h-4"/>
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          let p = i + 1;
          // sliding window for large page counts
          if (pages > 7) {
            const start = Math.max(1, Math.min(page - 3, pages - 6));
            p = start + i;
          }
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? "bg-primary text-white" : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onChange(page + 1)} disabled={page === pages}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-40 transition-all"
        >
          <ChevronRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onSave, isSaved, isSaving, searchLocation, canUseSoftphone }: {
  lead: LocalLead; onSave: (l: LocalLead) => void; isSaved: boolean; isSaving: boolean; searchLocation?: string; canUseSoftphone?: boolean;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [showPitch,   setShowPitch]   = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedCallScript, setCopiedCallScript] = useState(false);
  const callScript = getLocalLeadCallScript(lead);

  const fullPitch = [
    `Subject: ${lead.pitchSubject}`,
    "",
    lead.pitchOpener,
    "",
    "Here's what I can help with:",
    ...lead.pitchPoints.map(p => `• ${p}`),
    "",
    `Would you be open to a quick 10-minute call to explore what's possible for ${lead.name}?`,
    "",
    "Best,",
    "[Your name]",
    "",
    "30-second call script:",
    callScript,
  ].join("\n");

  const borderCls =
    (lead.websiteStatus === "none" || lead.websiteStatus === "unknown") ? "border-red-500/20 hover:border-red-500/40 shadow-red-500/5" :
    lead.websiteStatus === "unreachable" ? "border-orange-500/25 hover:border-orange-500/50"             :
    lead.websiteStatus === "outdated"    ? "border-yellow-500/20 hover:border-yellow-500/40"              :
    "border-border hover:border-primary/30";

  const scoreCls =
    lead.score >= 90 ? "text-red-400 font-bold" :
    lead.score >= 70 ? "text-yellow-400 font-semibold" :
    "text-muted-foreground";

  const scoreBarCls =
    lead.score >= 90 ? "bg-red-400" :
    lead.score >= 70 ? "bg-yellow-400" :
    lead.score >= 50 ? "bg-primary/60" :
    "bg-muted-foreground/30";

  const allEmails = [
    ...(lead.email ? [{ addr: lead.email, type: "verified" as const }] : []),
    ...(lead.guessedEmails ?? []).filter(e => e !== lead.email).map(e => ({ addr: e, type: "guessed" as const })),
  ];
  const phoneType = getPhoneTypeInfo(lead.phone, lead.country);
  const smallOperatorSignal = getSmallOperatorSignal(lead);

  const proposalDomain = lead.website
    ? lead.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]!
    : "";
  const proposalParams = new URLSearchParams({
    company: lead.name,
    title: `Website for ${lead.name}`,
    description: lead.pitchOpener.slice(0, 400),
    niche: "web-development",
    leadType: "local-business",
  });
  if (proposalDomain) proposalParams.set("domain", proposalDomain);
  const mapsHref = lead.mapsUrl || googleMapsBusinessProfileUrl(lead);
  if (mapsHref) proposalParams.set("url", mapsHref);
  const proposalHref = `/dashboard/proposal/new?${proposalParams.toString()}`;
  const decisionParams = new URLSearchParams({
    company: lead.name,
    location: decisionMakerLocation(lead, searchLocation),
    source: "local-leads",
    autoRun: "1",
  });
  if (proposalDomain) decisionParams.set("domain", proposalDomain);
  if (lead.website) decisionParams.set("website", lead.website);
  if (mapsHref) decisionParams.set("profileUrl", mapsHref);
  const decisionCountry = decisionMakerCountryParam(lead.country);
  if (decisionCountry) decisionParams.set("country", decisionCountry);
  const decisionHref = `/dashboard/decision-makers?${decisionParams.toString()}`;
  const siteBuilderParams = new URLSearchParams({
    company: lead.name,
    category: lead.categoryLabel ?? lead.category ?? "Local business",
    location: decisionMakerLocation(lead, searchLocation),
    address: lead.address ?? "",
    phone: lead.phone ?? "",
    pitch: lead.pitchOpener.slice(0, 360),
    status: lead.websiteStatus,
  });
  if (lead.website) siteBuilderParams.set("website", lead.website);
  if (mapsHref) siteBuilderParams.set("maps", mapsHref);
  if (proposalDomain) siteBuilderParams.set("domain", proposalDomain);
  const siteBuilderHref = `/dashboard/web-design?${siteBuilderParams.toString()}`;
  const softphoneHref = lead.phone
    ? `/dashboard/softphone?phone=${encodeURIComponent(lead.phone)}`
    : "/dashboard/softphone";

  return (
    <div className={`dashboard-result-card group border rounded-xl p-5 transition-all ${borderCls}`}>
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badge row 1 */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <WebsiteBadge status={lead.websiteStatus} tech={lead.websiteTech} age={lead.websiteAge}/>
            <OpportunityBadge type={lead.opportunityType}/>
            <UrgencyBadge urgency={lead.urgency}/>
            {lead.rating != null && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
                <Star className="w-3 h-3 fill-yellow-400"/> {lead.rating.toFixed(1)}
                {lead.reviewCount != null && <span className="opacity-60 ml-0.5">({lead.reviewCount})</span>}
              </span>
            )}
          </div>

          {/* Badge row 2 */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            {(lead.categoryLabel || lead.category) && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 font-medium capitalize">
                {lead.categoryLabel ?? lead.category}
              </span>
            )}
            {lead.revenueEst && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                <DollarSign className="w-3 h-3"/> {lead.revenueEst}/mo potential
              </span>
            )}
            {smallOperatorSignal.matches && (
              <span
                title={smallOperatorTitle(lead)}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium"
              >
                <Store className="w-3 h-3"/> {smallOperatorSignal.label}
              </span>
            )}
            <span className={`text-xs ml-auto ${scoreCls}`} title="Priority score (0–100)">
              Score {lead.score}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-foreground font-bold text-lg mb-2 group-hover:text-primary-light transition-colors">{lead.name}</h3>

          {/* Details */}
          <div className="space-y-1.5 mb-3">
            {lead.address && (
              <p className="text-muted-foreground text-sm flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-light mt-0.5"/> {lead.address}
              </p>
            )}

            {/* Phone — prominently displayed */}
            {lead.phone ? (
              <div className="flex items-center gap-1.5 text-sm flex-wrap">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-accent"/>
                <a href={`tel:${lead.phone}`} className="text-accent font-mono font-semibold hover:underline">{lead.phone}</a>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getPhoneTypeTone(phoneType.type)}`}
                  title={`${phoneType.label}${phoneType.confidence === "low" ? " — carrier lookup is needed to verify mobile vs landline." : ""}`}
                >
                  {phoneType.shortLabel}
                </span>
                <CopyBtn text={lead.phone}/>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1 italic">
                  <Phone className="w-3 h-3"/> No phone on record —
                </span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(lead.name + " " + lead.city + " phone number")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-light hover:underline font-medium flex items-center gap-0.5"
                >
                  Find phone <ExternalLink className="w-2.5 h-2.5"/>
                </a>
              </div>
            )}

            {/* Emails */}
            {allEmails.length > 0 ? allEmails.map(({ addr, type }) => (
              <div key={addr} className="flex items-center gap-1.5 text-sm">
                <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${type === "verified" ? "text-primary-light" : "text-muted-foreground"}`}/>
                <a href={`mailto:${addr}`} className={`hover:underline truncate max-w-xs ${type === "verified" ? "text-primary-light" : "text-muted-foreground"}`}>
                  {addr}
                </a>
                {type === "guessed" && <span className="text-[10px] text-muted-foreground/60 italic">(guessed)</span>}
                <CopyBtn text={addr}/>
              </div>
            )) : null}

            {/* Website */}
            {lead.website ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="w-3.5 h-3.5 flex-shrink-0"/>
                <a href={lead.website} target="_blank" rel="noopener noreferrer"
                  className="hover:text-primary-light hover:underline truncate max-w-xs">
                  {lead.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                </a>
                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50"/>
              </div>
            ) : (
              <p className="text-sm flex items-center gap-1.5 font-medium">
                {lead.websiteStatus === "none"
                  ? <><Globe className="w-3.5 h-3.5 flex-shrink-0 text-red-400/70 shrink-0"/><span className="text-red-400/70">No website confirmed — prime opportunity</span></>
                  : <><Globe className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/50 shrink-0"/><span className="text-muted-foreground/60">Website status unverified — check Google Maps</span></>
                }
              </p>
            )}
          </div>

          {/* Score bar */}
          <div className="mb-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${scoreBarCls}`}
                style={{ width: `${lead.score}%` }}/>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
            <span className="rounded-full border border-border bg-surface px-2.5 py-1">1. Verify profile</span>
            <span className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-accent">2. Find owner</span>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-primary-light">3. Pitch or design</span>
          </div>

          {/* Pitch toggle */}
          <button onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-primary transition-colors">
            <Lightbulb className="w-4 h-4 text-yellow-400"/> What to Pitch
            {expanded ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
          </button>
          {expanded && (
            <ul className="mt-2.5 space-y-1.5">
              {lead.pitchPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0"/> {pt}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action column */}
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:w-[132px] xl:flex-col xl:flex-shrink-0">
          <a href={mapsHref} target="_blank" rel="noopener noreferrer"
            title="Search this business on Google Maps to see phone, hours, and reviews"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-xs font-medium transition-all">
            <MapPin className="w-3.5 h-3.5"/> Google Maps
          </a>
          <button onClick={() => setShowPitch(v => !v)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showPitch ? "bg-yellow-400/15 border-yellow-400/40 text-yellow-400" : "border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"}`}>
            <Sparkles className="w-3.5 h-3.5"/> {showPitch ? "Hide Pitch" : "Get Pitch"}
          </button>
          <button onClick={() => onSave(lead)} disabled={isSaved || isSaving}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isSaved ? "bg-accent/10 text-accent border border-accent/30 cursor-default" : "bg-primary/10 text-primary-light border border-primary/30 hover:bg-primary/20"}`}>
            {isSaved
              ? <><CheckCircle className="w-3.5 h-3.5"/> Saved</>
              : <><Bookmark className="w-3.5 h-3.5"/>{isSaving ? "…" : "Save Lead"}</>
            }
          </button>
          <Link
            href={decisionHref}
            title="Find the owner, manager, or best public contact for this business"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-accent/25 bg-accent/10 text-accent text-xs font-medium hover:bg-accent/15 transition-all">
            <Users className="w-3.5 h-3.5"/> Find Owner
          </Link>
          {canUseSoftphone && lead.phone && (
            <Link
              href={softphoneHref}
              title="Call this business from the admin softphone"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-400/15 transition-all">
              <PhoneCall className="w-3.5 h-3.5"/> Call
            </Link>
          )}
          <Link
            href={siteBuilderHref}
            title="Create a shareable website draft for this business"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 text-xs font-semibold hover:bg-cyan-400/15 transition-all">
            <Palette className="w-3.5 h-3.5"/> Design Site
          </Link>
          <Link
            href={proposalHref}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-hero text-white text-xs font-semibold hover:opacity-90 transition-all">
            <Sparkles className="w-3.5 h-3.5"/> AI Proposal
          </Link>
        </div>
      </div>

      {/* Full pitch panel */}
      {showPitch && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-light"/> Ready-to-Send Cold Pitch
            </h4>
            <button
              onClick={() => { void copyText(fullPitch).then(() => { setCopiedPitch(true); setTimeout(() => setCopiedPitch(false), 2000); }); }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${copiedPitch ? "bg-accent/10 text-accent border-accent/30" : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}>
              {copiedPitch ? <><CheckCircle className="w-3 h-3"/> Copied!</> : <><Copy className="w-3 h-3"/> Copy Pitch</>}
            </button>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3 text-sm">
            <div className="pb-2 border-b border-border">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Subject Line</span>
              <p className="text-foreground font-semibold mt-0.5">{lead.pitchSubject}</p>
            </div>
            <p className="text-muted-foreground leading-relaxed">{lead.pitchOpener}</p>
            <div>
              <p className="text-foreground font-medium mb-1.5">Here&apos;s what I can help with:</p>
              <ul className="space-y-1">
                {lead.pitchPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-accent mt-0.5 flex-shrink-0">•</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-muted-foreground">
              Would you be open to a quick 10-minute call to explore what&apos;s possible for <strong className="text-foreground">{lead.name}</strong>?
            </p>
            <p className="text-muted-foreground text-xs border-t border-border pt-2">
              Best,<br/><span className="italic opacity-60">[Your name]</span>
            </p>
          </div>
          <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h5 className="flex items-center gap-2 font-bold text-foreground">
                <PhoneCall className="h-4 w-4 text-accent"/> 30-Second Call Script
              </h5>
              <button
                onClick={() => { void copyText(callScript).then(() => { setCopiedCallScript(true); setTimeout(() => setCopiedCallScript(false), 2000); }); }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${copiedCallScript ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
                {copiedCallScript ? <><CheckCircle className="h-3 w-3"/> Copied!</> : <><Copy className="h-3 w-3"/> Copy Script</>}
              </button>
            </div>
            <p className="leading-relaxed text-muted-foreground">{callScript}</p>
            <p className="mt-2 border-t border-accent/15 pt-2 text-xs text-muted-foreground/80">
              Keep it permission-based: identify yourself, be brief, and honour do-not-call or opt-out requests.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LocalLeadsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [keyword,    setKeyword]    = useState("");
  const [location,   setLocation]   = useState("");
  const [filter,     setFilter]     = useState<"all"|"no_website"|"outdated_website"|"has_website">("no_website");
  const [results,    setResults]    = useState<LocalLead[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [meta,       setMeta]       = useState<{ source?: string; geocoded?: boolean; cached?: boolean; sources?: string[] } | null>(null);
  const [savedIds,   setSavedIds]   = useState<Set<string>>(new Set());
  const [savingId,   setSavingId]   = useState<string | null>(null);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [showSugg,       setShowSugg]       = useState<"keyword" | "location" | null>(null);
  const [kwCategory,     setKwCategory]     = useState<string | null>(null);
  const [locRegion,      setLocRegion]      = useState<string | null>(null);
  const [page,           setPage]           = useState(1);
  const [leadsViewed,    setLeadsViewed]    = useState(0);
  const [dailyLimit,     setDailyLimit]     = useState(FREE_PLAN_LIMIT);
  const [userPlan,       setUserPlan]       = useState<string>("free");
  const [usageResetAt,   setUsageResetAt]   = useState<string | null>(null);
  const [shareBonusClaimed, setShareBonusClaimed] = useState(false);
  const [showBonus,      setShowBonus]      = useState(false);
  const [limitNotice,    setLimitNotice]    = useState("");
  const [yelpKey,        setYelpKey]        = useState("");
  const [fsqKey,         setFsqKey]         = useState("");
  const [cacheReady,     setCacheReady]     = useState(false);
  // Extra filters
  const [hasPhone,       setHasPhone]       = useState(false);
  const [smallOperatorOnly, setSmallOperatorOnly] = useState(false);
  const [phoneTypeFilter, setPhoneTypeFilter] = useState<PhoneTypeFilter>("all");
  const [minRating,      setMinRating]      = useState(0);
  const [showFilters,    setShowFilters]    = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const syncUsage = useCallback((usage: UsageStats | null) => {
    if (!usage) return;
    setUserPlan(usage.plan ?? "free");
    setDailyLimit(Number.isFinite(usage.limit) ? usage.limit : FREE_PLAN_LIMIT);
    setLeadsViewed(Number.isFinite(usage.used) ? usage.used : 0);
    setUsageResetAt(typeof usage.nextReset === "string" ? usage.nextReset : null);
    setShareBonusClaimed(Boolean(usage.shareBonusClaimed));
  }, []);

  // Load persisted state and latest server-side usage
  useEffect(() => {
    if (sessionStatus === "loading") return;
    // Clear stale lead caches on schema changes
    try {
      if (sessionStorage.getItem("icl_cache_v") !== "7") {
        sessionStorage.removeItem("ff_ss_live_results");
        sessionStorage.removeItem("ff_ss_remote_results");
        sessionStorage.removeItem("ff_ss_local_results");
        sessionStorage.setItem("icl_cache_v", "7");
      }
    } catch {}
    setYelpKey(localStorage.getItem(LOCAL_YELP_KEY_KEY) ?? "");
    setFsqKey(localStorage.getItem(LOCAL_FSQ_KEY_KEY)   ?? "");
    // Restore cached results so they persist when switching tabs
    try {
      const cached = sessionStorage.getItem(SS_LOCAL_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as LocalLeadsCache;
        if (Array.isArray(parsed.results)) setResults(parsed.results);
        if (typeof parsed.keyword === "string") setKeyword(parsed.keyword);
        if (typeof parsed.location === "string") setLocation(parsed.location);
        if (parsed.filter && ["all", "no_website", "outdated_website", "has_website"].includes(parsed.filter)) setFilter(parsed.filter);
        setHasPhone(Boolean(parsed.hasPhone));
        setSmallOperatorOnly(Boolean(parsed.smallOperatorOnly));
        if (parsed.phoneTypeFilter && PHONE_TYPE_FILTERS.some(option => option.value === parsed.phoneTypeFilter)) {
          setPhoneTypeFilter(parsed.phoneTypeFilter);
        }
        setMinRating(typeof parsed.minRating === "number" ? parsed.minRating : 0);
        setPage(typeof parsed.page === "number" && parsed.page > 0 ? parsed.page : 1);
        setMeta(parsed.meta ?? null);
        if (Array.isArray(parsed.savedIds)) setSavedIds(new Set(parsed.savedIds));
      }
    } catch {}
    setCacheReady(true);
    fetch("/api/usage")
      .then(r => r.ok ? r.json() as Promise<UsageStats> : null)
      .then(syncUsage)
      .catch(() => {});
  }, [sessionStatus, syncUsage]);

  useEffect(() => {
    if (!cacheReady) return;
    try {
      const payload: LocalLeadsCache = {
        results,
        keyword,
        location,
        filter,
        hasPhone,
        smallOperatorOnly,
        phoneTypeFilter,
        minRating,
        page,
        meta,
        savedIds: [...savedIds],
      };
      sessionStorage.setItem(SS_LOCAL_KEY, JSON.stringify(payload));
    } catch {}
  }, [cacheReady, results, keyword, location, filter, hasPhone, smallOperatorOnly, phoneTypeFilter, minRating, page, meta, savedIds]);

  const resetAt = usageResetAt ? new Date(usageResetAt) : null;

  const isPaidPlan  = userPlan === "pro" || userPlan === "agency";
  const isOverLimit = !isPaidPlan && leadsViewed >= dailyLimit;

  const doSearch = useCallback(async () => {
    if (!keyword.trim() || !location.trim() || isOverLimit) return;
    setLoading(true); setError(""); setLimitNotice(""); setPage(1); setShowSugg(null); setPhoneTypeFilter("all");
    try {
      const body: Record<string, unknown> = {
        keyword: keyword.trim(), location: location.trim(), filter,
      };
      if (yelpKey) body.yelpKey = yelpKey;
      if (fsqKey)  body.foursquareKey = fsqKey;

      const res = await postLocalLeadSearch(body);
      let data: {
        results?: LocalLead[];
        source?: string;
        sources?: string[];
        total?: number;
        totalAvailable?: number;
        geocoded?: boolean;
        cached?: boolean;
        capped?: boolean;
        usage?: UsageStats;
        error?: string;
        nextReset?: string;
        limit?: number;
      };
      try {
        data = await res.json() as typeof data;
      } catch {
        setError("Server error. Please try again in a moment.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        if (res.status === 429) {
          if (typeof data.limit === "number") setDailyLimit(data.limit);
          if (typeof data.nextReset === "string") setUsageResetAt(data.nextReset);
          if (typeof data.limit === "number") setLeadsViewed(data.limit);
        }
        return;
      }
      if (!data.geocoded) {
        setError(`Could not find "${location}" — try a city name like "Chicago, IL" or "Sydney, Australia".`);
        return;
      }
      const newResults = data.results ?? [];
      if (!isPaidPlan && data.capped) {
        setLimitNotice(
          `Showing the first ${newResults.length} businesses available in your free daily allowance. Claim bonus leads to keep searching.`
        );
      } else {
        setLimitNotice("");
      }
      setResults(newResults);
      const searchDetails = {
        lead_type: "local_business",
        search_term: keyword.trim(),
        search_location: location.trim(),
        result_count: newResults.length,
        website_filter: filter,
      };
      trackAnalyticsEvent("search", searchDetails);
      trackAnalyticsEvent("lead_search", searchDetails);
      setMeta({ source: data.source, geocoded: data.geocoded, cached: data.cached, sources: data.sources });
      try {
        sessionStorage.setItem(SS_LOCAL_KEY, JSON.stringify({
          results: newResults,
          keyword: keyword.trim(),
          location: location.trim(),
          filter,
          hasPhone,
          smallOperatorOnly,
          phoneTypeFilter: "all",
          minRating,
          page: 1,
          meta: { source: data.source, geocoded: data.geocoded, cached: data.cached, sources: data.sources },
          savedIds: [...savedIds],
        } satisfies LocalLeadsCache));
      } catch {}
      syncUsage(data.usage ?? null);

      // Scroll results into view
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "Search is taking too long because a live data source is slow. Try again in a moment."
          : "Network error. Please try again — live search will retry once automatically."
      );
    }
    finally { setLoading(false); }
  }, [keyword, location, filter, hasPhone, smallOperatorOnly, minRating, savedIds, isOverLimit, isPaidPlan, yelpKey, fsqKey, syncUsage]);

  const handleSave = async (lead: LocalLead) => {
    if (savedIds.has(lead.id)) return;
    setSavingId(lead.id); setSaveError(null);
    try {
      const mapsHref = lead.mapsUrl || googleMapsBusinessProfileUrl(lead);
      const domain = lead.website
        ? lead.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]!
        : lead.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".local";
      const phoneType = getPhoneTypeInfo(lead.phone, lead.country);
      const callScript = getLocalLeadCallScript(lead);
      const smallSignal = getSmallOperatorSignal(lead);
      const res = await fetch("/api/leads/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company:     lead.name,
          domain,
          email:       lead.email ?? (lead.guessedEmails?.[0] ?? null),
          phone:       lead.phone ?? null,
          niche:       lead.categoryLabel ?? lead.category ?? "local business",
          title:       `Local Business Lead — ${lead.categoryLabel ?? lead.category ?? "General"} (${websiteStatusLabel(lead.websiteStatus)})`,
          description: lead.pitchOpener,
          sourceUrl:   mapsHref,
          source:      "local_business",
          isManual:    true,
          notes: [
            `Address: ${lead.address}`,
            lead.country ? `Country: ${lead.country}` : null,
            `Phone: ${lead.phone ?? "None"}`,
            lead.phone ? `Phone Type: ${phoneType.label}${phoneType.confidence === "low" ? " (not carrier-verified)" : ""}` : null,
            `Website: ${lead.website ?? "None"} (${lead.websiteStatus}${lead.websiteTech ? ` — ${lead.websiteTech}` : ""}${lead.websiteAge ? ` — ${lead.websiteAge}` : ""})`,
            lead.rating != null ? `Rating: ${lead.rating}★ (${lead.reviewCount ?? 0} reviews)` : null,
            lead.revenueEst ? `Revenue Potential: ${lead.revenueEst}/mo` : null,
            smallSignal.matches ? `Small Operator Signal: ${smallSignal.score}/100 (${smallSignal.reasons.join("; ")})` : null,
            lead.guessedEmails?.length ? `Guessed Emails: ${lead.guessedEmails.join(", ")}` : null,
            "Lead Coverage: Live local search",
            `Priority Score: ${lead.score}/100 (${lead.urgency} urgency)`,
            "",
            "Pitch Points:",
            ...lead.pitchPoints.map(p => `• ${p}`),
            "",
            "30-Second Call Script:",
            callScript,
          ].filter(Boolean).join("\n"),
        }),
      });
      if (res.ok) setSavedIds(p => new Set([...p, lead.id]));
      else {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setSaveError(d.error ?? "Save failed");
      }
    } catch { setSaveError("Network error"); }
    finally { setSavingId(null); }
  };

  // Apply all client-side filters. Keep phone-type counts based on the visible
  // search context before the user chooses a specific number type.
  const baseFilteredResults = useMemo(() => results.filter(r => {
    // Website status filter (the main Show: selector)
    // "No Website" shows confirmed none + unverified businesses - both worth pitching.
    if (filter === "no_website"       && r.websiteStatus !== "none" && r.websiteStatus !== "unknown") return false;
    if (filter === "outdated_website" && r.websiteStatus !== "outdated" && r.websiteStatus !== "unreachable") return false;
    if (filter === "has_website"      && (!r.website || r.websiteStatus === "none" || r.websiteStatus === "unknown")) return false;
    if (hasPhone  && !r.phone)                    return false;
    if (minRating && (r.rating ?? 0) < minRating) return false;
    return true;
  }), [results, filter, hasPhone, minRating]);
  const smallOperatorCount = useMemo(
    () => baseFilteredResults.filter(r => getSmallOperatorSignal(r).matches).length,
    [baseFilteredResults]
  );
  const primaryFilteredResults = useMemo(
    () => smallOperatorOnly ? baseFilteredResults.filter(r => getSmallOperatorSignal(r).matches) : baseFilteredResults,
    [baseFilteredResults, smallOperatorOnly]
  );
  const phoneTypeCounts = useMemo(() => PHONE_TYPE_FILTERS.reduce<Record<PhoneTypeFilter, number>>((counts, option) => {
    counts[option.value] = option.value === "all"
      ? primaryFilteredResults.length
      : primaryFilteredResults.filter(r => matchesPhoneTypeFilter(r, option.value)).length;
    return counts;
  }, { ...PHONE_TYPE_COUNT_ZERO }), [primaryFilteredResults]);
  const filteredResults = useMemo(
    () => primaryFilteredResults.filter(r => matchesPhoneTypeFilter(r, phoneTypeFilter)),
    [primaryFilteredResults, phoneTypeFilter]
  );
  const pagedResults  = filteredResults.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  // Counts from ALL results so the badges always show the full breakdown
  const noWebsite     = results.filter(r => r.websiteStatus === "none" || r.websiteStatus === "unknown").length;
  const outdated      = results.filter(r => r.websiteStatus === "outdated" || r.websiteStatus === "unreachable").length;
  const hotLeads      = filteredResults.filter(r => r.urgency === "high").length;
  const withPhone     = primaryFilteredResults.filter(r => !!r.phone).length;
  const mobilePhoneLeads = phoneTypeCounts.mobile;
  const landlineLeads = phoneTypeCounts.landline;
  const businessUnknownLeads = phoneTypeCounts.business_unknown;
  const filtersActive = hasPhone || smallOperatorOnly || phoneTypeFilter !== "all" || minRating > 0 || filter !== "all";
  const selectedPhoneTypeOption = PHONE_TYPE_FILTERS.find(option => option.value === phoneTypeFilter);
  const activeFilterLabels = [
    filter === "no_website" ? "No/Unknown Website" : null,
    filter === "outdated_website" ? "Outdated Site" : null,
    filter === "has_website" ? "Has Website" : null,
    hasPhone ? "Has Phone" : null,
    smallOperatorOnly ? "Small Operator" : null,
    phoneTypeFilter !== "all" ? selectedPhoneTypeOption?.label : null,
    minRating > 0 ? `${minRating} star minimum rating` : null,
  ].filter(Boolean) as string[];
  const selectedPhoneTypeCount = phoneTypeCounts[phoneTypeFilter] ?? 0;
  const hasDemo       = meta?.sources?.includes("demo");

  useEffect(() => {
    if (phoneTypeFilter === "all" || loading || primaryFilteredResults.length === 0) return;
    if (selectedPhoneTypeCount > 0) return;
    setPhoneTypeFilter("all");
    setPage(1);
  }, [phoneTypeFilter, loading, primaryFilteredResults.length, selectedPhoneTypeCount]);

  return (
    <div className="dashboard-page">
      <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5 flex-wrap">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-white"/>
          </div>
          Local Business Leads
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold">LIVE INTELLIGENCE</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl leading-relaxed">
          Find local businesses with weak or missing web presence using live business profiles,
          contact signals, website checks, and AI-ready pitch context.
        </p>
      </div>

      {/* Daily usage bar — free plan only */}
      {!isOverLimit && !isPaidPlan && (
        <div className="dashboard-control-panel rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-semibold text-foreground">Daily free leads</p>
              <p className="text-xs text-muted-foreground">{leadsViewed} / {dailyLimit} today · resets in 24h</p>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${leadsViewed / dailyLimit > 0.8 ? "bg-red-400" : leadsViewed / dailyLimit > 0.5 ? "bg-yellow-400" : "bg-accent"}`}
                style={{ width: `${Math.min(100, (leadsViewed / dailyLimit) * 100)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBonus(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-light transition-all hover:bg-primary/15"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {shareBonusClaimed ? "+300 bonus active" : "Unlock +300"}
          </button>
        </div>
      )}

      {/* Daily limit hit */}
      {isOverLimit && (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <p className="text-foreground font-semibold mb-2">You've used your {dailyLimit} free local leads today</p>
          <p className="text-muted-foreground text-sm mb-4">
            {shareBonusClaimed
              ? "Your share bonus is active. Request a larger allowance and we will review it."
              : "Unlock +300 more leads instantly — free."}
          </p>
          <button onClick={() => setShowBonus(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-all shadow-glow-primary">
            {shareBonusClaimed ? "Request More Leads" : "Unlock +300 Free Leads"}
          </button>
        </div>
      )}

      {(!isOverLimit || results.length > 0 || loading || error || saveError) && (
        <>
          {/* Search form */}
          <div className="dashboard-control-panel rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Keyword with grouped category dropdown */}
              <div className="relative">
                <label className="dashboard-field-label text-sm font-bold uppercase tracking-wide mb-2 block">Business Type</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light pointer-events-none"/>
                  <input value={keyword} onChange={e => { setKeyword(e.target.value); setKwCategory(null); setShowSugg("keyword"); }}
                    onFocus={() => setShowSugg("keyword")} onClick={() => setShowSugg("keyword")}
                    onBlur={() => setTimeout(() => setShowSugg(current => current === "keyword" ? null : current), 250)}
                    onKeyDown={e => { if (e.key === "Enter") void doSearch(); }}
                    placeholder="e.g. plumber, dentist, bakery…"
                    className="dashboard-field w-full min-h-12 pl-12 pr-4 py-3 border rounded-xl text-foreground focus:outline-none transition-all text-base"/>
                </div>
                {showSugg === "keyword" && (
                  <div onPointerDown={e => e.preventDefault()} className="absolute top-full mt-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-xl z-30 max-h-72 overflow-y-auto">
                    {keyword === "" && !kwCategory ? (
                      /* Show category browser when nothing typed */
                      <>
                        <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Browse by Category</p>
                        {Object.keys(KEYWORD_CATEGORIES).map(cat => (
                          <button key={cat} onPointerDown={(e) => { e.preventDefault(); setKwCategory(cat); }}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors flex items-center justify-between">
                            {cat}
                            <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90"/>
                          </button>
                        ))}
                      </>
                    ) : kwCategory && keyword === "" ? (
                      /* Show items in selected category */
                      <>
                        <button onPointerDown={(e) => { e.preventDefault(); setKwCategory(null); }}
                          className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border-b border-border">
                          <ChevronDown className="w-3 h-3 rotate-90"/> Back
                        </button>
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kwCategory}</p>
                        {KEYWORD_CATEGORIES[kwCategory]!.map(s => (
                          <button key={s} onPointerDown={(e) => { e.preventDefault(); setKeyword(s); setShowSugg(null); setKwCategory(null); }}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 capitalize transition-colors">
                            {s}
                          </button>
                        ))}
                      </>
                    ) : (
                      /* Filtered search results */
                      KEYWORD_SUGGESTIONS.filter(s => s.toLowerCase().includes(keyword.toLowerCase())).slice(0, 30).map(s => (
                        <button key={s} onPointerDown={(e) => { e.preventDefault(); setKeyword(s); setShowSugg(null); }}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 capitalize transition-colors">
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Location with grouped region dropdown */}
              <div className="relative">
                <label className="dashboard-field-label text-sm font-bold uppercase tracking-wide mb-2 block">City / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light pointer-events-none"/>
                  <input value={location} onChange={e => { setLocation(e.target.value); setLocRegion(null); setShowSugg("location"); }}
                    onFocus={() => setShowSugg("location")} onClick={() => setShowSugg("location")}
                    onBlur={() => setTimeout(() => setShowSugg(current => current === "location" ? null : current), 250)}
                    onKeyDown={e => { if (e.key === "Enter") void doSearch(); }}
                    placeholder="e.g. Manchester, UK or Dubai, UAE"
                    className="dashboard-field w-full min-h-12 pl-12 pr-4 py-3 border rounded-xl text-foreground focus:outline-none transition-all text-base"/>
                </div>
                {showSugg === "location" && (
                  <div onPointerDown={e => e.preventDefault()} className="absolute top-full mt-1 left-0 right-0 bg-surface border border-border rounded-xl shadow-xl z-30 max-h-72 overflow-y-auto">
                    {location === "" && !locRegion ? (
                      /* Show region browser */
                      <>
                        <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Browse by Region</p>
                        {Object.keys(LOCATION_GROUPS).map(region => (
                          <button key={region} onPointerDown={(e) => { e.preventDefault(); setLocRegion(region); }}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors flex items-center justify-between">
                            {region}
                            <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90"/>
                          </button>
                        ))}
                      </>
                    ) : locRegion && location === "" ? (
                      /* Show cities in region */
                      <>
                        <button onPointerDown={(e) => { e.preventDefault(); setLocRegion(null); }}
                          className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border-b border-border">
                          <ChevronDown className="w-3 h-3 rotate-90"/> Back
                        </button>
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{locRegion}</p>
                        {LOCATION_GROUPS[locRegion]!.map(s => (
                          <button key={s} onPointerDown={(e) => { e.preventDefault(); setLocation(s); setShowSugg(null); setLocRegion(null); }}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors">
                            {s}
                          </button>
                        ))}
                      </>
                    ) : (
                      /* Filtered search */
                      LOCATION_SUGGESTIONS.filter(s => s.toLowerCase().includes(location.toLowerCase())).slice(0, 30).map(s => (
                        <button key={s} onPointerDown={(e) => { e.preventDefault(); setLocation(s); setShowSugg(null); }}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors">
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Website status filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="dashboard-field-label text-xs font-bold uppercase tracking-wide hidden sm:block">Show:</span>
              {([
                { v: "no_website",       l: "No/Unknown Website", i: WifiOff,   c: "text-red-400" },
                { v: "outdated_website", l: "Outdated Site",      i: Clock,     c: "text-yellow-400" },
                { v: "has_website",      l: "Has Website",        i: Wifi,      c: "text-green-400" },
                { v: "all",              l: "All",                i: Building2, c: "text-muted-foreground" },
              ] as const).map(({ v, l, i: Icon, c }) => (
                <button key={v} onClick={() => { setFilter(v); setPage(1); }}
                  className={`dashboard-choice flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${filter === v ? "bg-primary/15 border-primary/55 text-primary-light shadow-sm" : "text-muted-foreground"}`}>
                  <Icon className={`w-3.5 h-3.5 ${filter === v ? "text-primary-light" : c}`}/>{l}
                </button>
              ))}
              <span title="No/Unknown Website includes confirmed no-website records and businesses where no website is available from profile data. Always verify on Google Maps before pitching." className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors">
                <Info className="w-3.5 h-3.5"/>
              </span>
            </div>

            {/* Extra filters row */}
            <div className="flex items-center gap-2 flex-wrap border-t border-border/50 pt-3">
              {/* Has phone toggle */}
              <button
                onClick={() => { setHasPhone(v => !v); setPage(1); }}
                className={`dashboard-choice flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${hasPhone ? "bg-accent/15 border-accent/50 text-accent shadow-sm" : "text-muted-foreground"}`}>
                <Phone className="w-3.5 h-3.5"/> Has Phone
              </button>

              <button
                type="button"
                title="Prioritises businesses that look owner-run, single-location, mobile/stall-based, or lower-resource from public profile signals. Verify before pitching."
                onClick={() => { setSmallOperatorOnly(v => !v); setPage(1); }}
                className={`dashboard-choice flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${smallOperatorOnly ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm" : "text-muted-foreground"}`}>
                <Store className="w-3.5 h-3.5"/> Small operator
                {baseFilteredResults.length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${smallOperatorOnly ? "bg-cyan-500/20 text-cyan-200" : "bg-muted text-muted-foreground"}`}>
                    {smallOperatorCount}
                  </span>
                )}
              </button>

              {/* Phone type */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="dashboard-field-label text-xs font-bold">Number type:</span>
                {PHONE_TYPE_FILTERS.map(option => {
                  const count = phoneTypeCounts[option.value] ?? 0;
                  const unavailable = option.value !== "all" && primaryFilteredResults.length > 0 && count === 0;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={unavailable ? `No ${option.label.toLowerCase()} numbers found in the current results.` : option.title}
                      disabled={unavailable}
                      onClick={() => { setPhoneTypeFilter(option.value); setPage(1); }}
                      className={`dashboard-choice inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all disabled:cursor-not-allowed ${
                        phoneTypeFilter === option.value
                          ? "bg-primary/15 border-primary/55 text-primary-light shadow-sm"
                          : unavailable
                            ? "border-border/70 bg-muted/20 text-muted-foreground/45"
                            : "text-muted-foreground"
                      }`}
                    >
                      <span>{option.label}</span>
                      {results.length > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                          phoneTypeFilter === option.value
                            ? "bg-primary/20 text-primary-light"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
                {primaryFilteredResults.length > 0 && businessUnknownLeads > 0 && (mobilePhoneLeads === 0 || landlineLeads === 0) && (
                  <p className="basis-full text-[11px] leading-relaxed text-muted-foreground/75">
                    US and Canada directories usually do not reveal mobile vs landline from the digits. Those numbers stay under Business / Unknown until a carrier-verified source confirms them.
                  </p>
                )}
              </div>

              {/* Min rating */}
              <div className="flex items-center gap-1.5">
                <span className="dashboard-field-label text-xs font-bold">Min rating:</span>
                {[0, 3, 3.5, 4, 4.5].map(r => (
                  <button key={r} onClick={() => { setMinRating(r); setPage(1); }}
                    className={`dashboard-choice px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${minRating === r ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-400 shadow-sm" : "text-muted-foreground"}`}>
                    {r === 0 ? "Any" : `${r}★`}
                  </button>
                ))}
              </div>

              {/* Clear extra filters */}
              {(hasPhone || smallOperatorOnly || phoneTypeFilter !== "all" || minRating > 0 || filter !== "all") && (
                <button onClick={() => { setHasPhone(false); setSmallOperatorOnly(false); setPhoneTypeFilter("all"); setMinRating(0); setFilter("all"); setPage(1); }}
                  className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3 h-3"/> Clear filters
                </button>
              )}

              {/* Search button */}
              <button onClick={() => void doSearch()} disabled={loading || !keyword.trim() || !location.trim() || isOverLimit}
                className="ml-auto min-h-12 flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-primary/20">
                {loading
                  ? <><RefreshCw className="w-4 h-4 animate-spin"/> Searching…</>
                  : <><Search className="w-4 h-4"/> Find Businesses</>
                }
              </button>
            </div>
          </div>

          {/* Errors */}
          {(error || saveError) && (
            <div className="flex items-center gap-3 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>
              <p className="text-sm">{error || saveError}</p>
              <button onClick={() => { setError(""); setSaveError(null); }} className="ml-auto text-destructive/60 hover:text-destructive">
                <X className="w-4 h-4"/>
              </button>
            </div>
          )}

          {limitNotice && !loading && (
            <div className="flex items-center gap-3 text-primary-light bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 flex-shrink-0"/>
              <p className="text-sm">{limitNotice}</p>
            </div>
          )}

          {/* Results section */}
          <div ref={resultsRef}>
            {!hasDemo && !loading && results.length > 0 && (
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 mb-4">
                <Info className="w-4 h-4 text-primary-light flex-shrink-0 mt-0.5"/>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-semibold">Live coverage</span>
                  {" "}— {filteredResults.length} businesses found. Ratings, reviews, phone numbers, website signals, and small-operator clues appear when available.
                </p>
              </div>
            )}

            {/* Results header */}
            {results.length > 0 && !loading && (
              <div className="flex items-center gap-3 flex-wrap text-sm mb-4">
                <span className="text-foreground font-bold">{filteredResults.length} businesses found</span>
                {/* Show "X total, Y after filters" context when filters reduce count */}
                {filtersActive && filteredResults.length !== results.length && (
                  <span className="text-muted-foreground text-xs">
                    ({results.length} total · filtered to {filteredResults.length})
                  </span>
                )}
                {noWebsite > 0 && <span className="text-red-400 font-medium">{noWebsite} with no website</span>}
                {outdated  > 0 && <span className="text-yellow-400 font-medium">{outdated} outdated/down</span>}
                {withPhone > 0 && <span className="text-accent font-medium">{withPhone} with phone</span>}
                {smallOperatorCount > 0 && <span className="text-cyan-300 font-medium">{smallOperatorCount} small operators</span>}
                {hotLeads  > 0 && <span className="flex items-center gap-1 text-red-400 font-medium"><Flame className="w-3.5 h-3.5"/>{hotLeads} hot leads</span>}
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => exportLocalLeadsCsv(filteredResults, keyword, location, activeFilterLabels)}
                    disabled={filteredResults.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary-light transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-45"
                    title="Download the current searched and filtered business results as a CSV file"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </button>
                  {meta?.cached && (
                    <span className="flex items-center gap-1 text-xs bg-surface text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                      <Clock className="w-3 h-3"/> Cached (24hr)
                    </span>
                  )}
                  {meta?.source === "live" && !hasDemo && (
                    <span className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20 font-medium">
                      <Zap className="w-3 h-3"/> Live data
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Loading overlay — keep old results visible underneath */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <MapPin className="w-7 h-7 text-primary-light"/>
                </div>
                <p className="text-foreground font-semibold">Searching for local leads…</p>
                <p className="text-muted-foreground text-sm">Finding {keyword} businesses in {location}</p>
              </div>
            )}

            {/* Filters reduced results to zero - show clear message */}
            {!loading && results.length > 0 && filteredResults.length === 0 && filtersActive && (
              <div className="text-center py-10 border border-dashed border-border rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto border border-yellow-500/20">
                  <Filter className="w-6 h-6 text-yellow-400"/>
                </div>
                <div>
                  <p className="text-foreground font-semibold">No results match your filters</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {results.length} businesses found, but none match{activeFilterLabels.length ? `: ${activeFilterLabels.join(", ")}.` : "."}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {phoneTypeFilter !== "all"
                      ? "For US and Canadian listings, mobile-vs-landline is rarely exposed from the number pattern. Try Business / Unknown or Any type."
                      : smallOperatorOnly
                        ? "Small-operator matching uses public clues like review volume, category, naming, and website status. Try clearing it if this niche has sparse data."
                      : filter === "no_website" || filter === "outdated_website"
                        ? "Try a different area or keyword - website data varies by location."
                        : "Broaden your filters to include leads without ratings or phone numbers."}
                  </p>
                </div>
                <button onClick={() => { setHasPhone(false); setSmallOperatorOnly(false); setPhoneTypeFilter("all"); setMinRating(0); setFilter("all"); setPage(1); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                  <X className="w-3.5 h-3.5"/> Clear filters to see {results.length} results
                </button>
              </div>
            )}

            {/* Result cards (paginated) */}
            {!loading && pagedResults.length > 0 && (
              <div className="space-y-4">
                {pagedResults.map((lead, index) => (
                  <Fragment key={lead.id}>
                  <LeadCard lead={lead} onSave={handleSave}
                    isSaved={savedIds.has(lead.id)} isSaving={savingId === lead.id}
                    searchLocation={location} canUseSoftphone={session?.user?.role === "ADMIN"}/>
                  {index === 5 && <LeadResultsAd />}
                  </Fragment>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredResults.length > ITEMS_PER_PAGE && (
              <div className="mt-6">
                <Pagination
                  page={page}
                  total={filteredResults.length}
                  perPage={ITEMS_PER_PAGE}
                  onChange={(p) => {
                    setPage(p);
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              </div>
            )}

            {/* Empty state — never searched */}
            {!loading && !error && results.length === 0 && !meta && (
              <div className="text-center py-20 border border-dashed border-border rounded-2xl space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-hero/10 flex items-center justify-center mx-auto border border-primary/20">
                  <MapPin className="w-10 h-10 text-primary-light"/>
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg">Find your next local client</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm mt-1.5 leading-relaxed">
                    Search by trade type and city to discover real businesses that need a website or digital upgrade —
                    with their phone number, guessed email, and a ready-to-send pitch.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Popular searches</p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {[["plumber","Chicago, IL"],["electrician","Los Angeles, CA"],["dentist","Sydney, Australia"],["mechanic","Toronto, Canada"],["bakery","London, UK"]].map(([k, l]) => (
                      <button key={k} onClick={() => { setKeyword(k ?? ""); setLocation(l ?? ""); }}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-primary-light transition-all">
                        {k} in {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state — searched but nothing found */}
            {!loading && !error && results.length === 0 && meta && (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto border border-yellow-500/20">
                  <MapPin className="w-8 h-8 text-yellow-400"/>
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg">No businesses found for this search</h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm mt-1.5 leading-relaxed">
                    Try a different city, broaden your search term, or remove extra filters for wider coverage.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                  <button onClick={() => void doSearch()}
                    className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary-light transition-all">
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      </div>

      <BonusLeadsModal
        isOpen={showBonus}
        onClose={() => setShowBonus(false)}
        onBonusClaimed={(_newBonus, _claim) => {
          setLimitNotice("");
          fetch("/api/usage")
            .then(r => r.ok ? r.json() as Promise<UsageStats> : null)
            .then(syncUsage)
            .catch(() => {});
        }}
        source="local-leads"
        currentPlan={userPlan}
      />
    </div>
  );
}
