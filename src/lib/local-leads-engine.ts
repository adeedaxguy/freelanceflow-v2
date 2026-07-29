/**
 * iCloseLeads — Local Business Leads Engine v2
 *
 * Multi-source, fully free, real-time architecture:
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SOURCE PRIORITY (parallel execution)                           │
 * │  1. Yelp Fusion API    — free 500 calls/day, best quality      │
 * │  2. HERE Discover API  — free 250k calls/month, great intl     │
 * │  3. OSM Overpass       — always free, no key, global           │
 * │  4. Smart demo data    — realistic, keyword-aware fallback     │
 * │                                                                 │
 * │  ENRICHMENT PIPELINE                                            │
 * │  • Nominatim geocoding (free, cached per city 24hr)            │
 * │  • Live website validation (HEAD request, tech detection)       │
 * │  • Email pattern generation (info@, contact@, hello@)          │
 * │  • Revenue opportunity estimate by business type               │
 * │  • Groq AI pitch enhancement for top 8 leads (free tier)       │
 * │                                                                 │
 * │  SCALING (zero cost, unlimited users)                           │
 * │  • Memory cache (Map) — instant repeat hits                    │
 * │  • SQLite cache (LocalLeadCache) — survives restarts           │
 * │  • 24hr TTL with background daily refresh                      │
 * │  • 3 Overpass mirrors with round-robin failover                │
 * │  • Per-user rate limit 20 searches/hr in memory               │
 * └─────────────────────────────────────────────────────────────────┘
 */

// ── Core types ─────────────────────────────────────────────────────────────────
export interface LocalBizLead {
  id:              string;
  name:            string;
  address:         string;
  city:            string;
  country:         string;
  lat?:            number;
  lon?:            number;
  phone?:          string;
  email?:          string;
  guessedEmails?:  string[];
  website?:        string;
  websiteStatus:   "none" | "alive" | "outdated" | "unreachable" | "unknown";
  websiteAge?:     string;
  websiteTech?:    string;
  mapsUrl:         string;
  yelpUrl?:        string;
  rating?:         number;
  reviewCount?:    number;
  category:        string;
  categoryLabel:   string;
  source:          "yelp" | "here" | "foursquare" | "osm" | "demo";
  osmId?:          string;
  isOpen?:         boolean;
  imageUrl?:       string;
  revenueEst?:     string;       // e.g. "$1,500 – $5,000 project"
  pitchPoints:     string[];
  pitchSubject:    string;
  pitchOpener:     string;
  callScript:      string;
  opportunityType: "no_website" | "outdated_website" | "modernise" | "seo";
  score:           number;
  urgency:         "high" | "medium" | "low";
  businessScale?:  "micro" | "small" | "standard" | "chain_or_large" | "unknown";
  businessScaleScore?: number;
  businessScaleReasons?: string[];
}

function googleMapsSearchUrl(...parts: Array<string | undefined | null>) {
  const query = parts.map(part => part?.trim()).filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const MICRO_BUSINESS_CATEGORY_RE =
  /\b(clean(?:ing|er)?|handyman|plumb(?:er|ing)?|electric(?:ian|al)?|roofer|roofing|painter|decorator|landscap(?:er|ing)?|lawn|gardener|barber|salon|nail|massage|spa|photograph(?:er|y)?|florist|bakery|cafe|coffee|catering|food truck|takeaway|restaurant|repair|detailing|car wash|locksmith|tutor|pet groom(?:er|ing)?|tailor|alteration|kiosk|stall|cart|market|pos)\b/i;
const MICRO_BUSINESS_NAME_RE =
  /\b(mobile|truck|cart|stall|kiosk|booth|pop[- ]?up|market|family|owner|independent|studio|local|artisan|handmade|street|home|van|caravan|trailer|solo)\b/i;
const MICRO_BUSINESS_ADDRESS_RE =
  /\b(stall|booth|kiosk|unit|suite|market|mall|plaza|van|trailer|caravan)\b/i;
const CHAIN_OR_LARGE_NAME_RE =
  /\b(walmart|mcdonald'?s|starbucks|subway|burger king|kfc|domino'?s|target|costco|tesco|sainsbury'?s|asda|aldi|lidl|cvs|walgreens|home depot|lowe'?s|best buy|dunkin'?|wendy'?s|chipotle|popeyes|taco bell|panda express|pizza hut|7-eleven)\b/i;
const LARGE_ORG_NAME_RE =
  /\b(holdings|group|corporation|enterprise|international|global|national|franchise)\b/i;

function businessScaleSignal(lead: Pick<LocalBizLead,
  "name" | "address" | "category" | "categoryLabel" | "websiteStatus" | "phone" | "reviewCount"
>): Pick<LocalBizLead, "businessScale" | "businessScaleScore" | "businessScaleReasons"> {
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

  if (MICRO_BUSINESS_CATEGORY_RE.test(category)) add(18, "local service or storefront category");
  if (MICRO_BUSINESS_NAME_RE.test(name)) add(16, "owner-run or mobile naming signal");
  if (MICRO_BUSINESS_ADDRESS_RE.test(address)) add(10, "small premises, stall, or mobile address clue");

  if (lead.websiteStatus === "none" || lead.websiteStatus === "unknown") {
    add(12, "weak or missing website signal");
  } else if (lead.websiteStatus === "outdated" || lead.websiteStatus === "unreachable") {
    add(8, "website needs attention");
  }

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

  if (CHAIN_OR_LARGE_NAME_RE.test(combined)) score -= 52;
  if (LARGE_ORG_NAME_RE.test(name)) score -= 18;

  score = Math.max(0, Math.min(100, score));

  const businessScale: LocalBizLead["businessScale"] =
    score >= 58 ? "micro" :
    score >= 40 ? "small" :
    score <= 12 ? "chain_or_large" :
    "standard";

  return {
    businessScale,
    businessScaleScore: score,
    businessScaleReasons: reasons.slice(0, 4),
  };
}

// ── OSM Keyword → Tag mapping (100+ business types) ───────────────────────────
type OsmTag = { key: string; value: string };
const OSM_MAP: Record<string, OsmTag[]> = {
  "plumber":          [{ key:"craft",   value:"plumber" }, { key:"shop", value:"plumber" }],
  "plumbing":         [{ key:"craft",   value:"plumber" }, { key:"shop", value:"plumber" }],
  "electrician":      [{ key:"craft",   value:"electrician" }, { key:"shop", value:"electrical" }, { key:"amenity", value:"electrical_supply" }],
  "electrical":       [{ key:"craft",   value:"electrician" }, { key:"shop", value:"electrical" }],
  "electric":         [{ key:"craft",   value:"electrician" }, { key:"shop", value:"electrical" }],
  "painter":          [{ key:"craft",   value:"painter" }, { key:"craft", value:"decorator" }],
  "painting":         [{ key:"craft",   value:"painter" }, { key:"craft", value:"decorator" }],
  "decorator":        [{ key:"craft",   value:"decorator" }, { key:"craft", value:"painter" }],
  "carpenter":        [{ key:"craft",   value:"carpenter" }, { key:"craft", value:"joiner" }],
  "carpentry":        [{ key:"craft",   value:"carpenter" }, { key:"craft", value:"joiner" }],
  "joiner":           [{ key:"craft",   value:"joiner" }, { key:"craft", value:"carpenter" }],
  "roofer":           [{ key:"craft",   value:"roofer" }],
  "roofing":          [{ key:"craft",   value:"roofer" }],
  "landscaper":       [{ key:"craft",   value:"gardener" }, { key:"shop", value:"garden_centre" }, { key:"craft", value:"landscaper" }],
  "landscaping":      [{ key:"craft",   value:"gardener" }, { key:"craft", value:"landscaper" }],
  "gardener":         [{ key:"craft",   value:"gardener" }],
  "locksmith":        [{ key:"craft",   value:"locksmith" }, { key:"shop", value:"locksmith" }],
  "hvac":             [{ key:"craft",   value:"hvac" }, { key:"craft", value:"heating_engineer" }, { key:"craft", value:"air_conditioning" }],
  "heating":          [{ key:"craft",   value:"heating_engineer" }, { key:"craft", value:"hvac" }],
  "air conditioning": [{ key:"craft",   value:"air_conditioning" }, { key:"craft", value:"hvac" }],
  "tiler":            [{ key:"craft",   value:"tiler" }],
  "tiling":           [{ key:"craft",   value:"tiler" }],
  "flooring":         [{ key:"shop",    value:"flooring" }],
  "glazier":          [{ key:"craft",   value:"glazier" }],
  "window":           [{ key:"craft",   value:"glazier" }],
  "pest control":     [{ key:"craft",   value:"pest_control" }],
  "pest":             [{ key:"craft",   value:"pest_control" }],
  "cleaning":         [{ key:"craft",   value:"cleaning" }, { key:"shop", value:"cleaning" }],
  "cleaner":          [{ key:"craft",   value:"cleaning" }],
  "fencing":          [{ key:"craft",   value:"fence_maker" }],
  "welder":           [{ key:"craft",   value:"metal_construction" }],
  "mechanic":         [{ key:"shop",    value:"car_repair" }],
  "auto repair":      [{ key:"shop",    value:"car_repair" }],
  "car repair":       [{ key:"shop",    value:"car_repair" }],
  "garage":           [{ key:"shop",    value:"car_repair" }],
  "car wash":         [{ key:"amenity", value:"car_wash" }],
  "dentist":          [{ key:"amenity", value:"dentist" }],
  "dental":           [{ key:"amenity", value:"dentist" }],
  "doctor":           [{ key:"amenity", value:"doctors" }],
  "clinic":           [{ key:"amenity", value:"clinic" }],
  "pharmacy":         [{ key:"amenity", value:"pharmacy" }],
  "optician":         [{ key:"shop",    value:"optician" }],
  "optometrist":      [{ key:"shop",    value:"optician" }],
  "physiotherapist":  [{ key:"amenity", value:"physiotherapist" }],
  "physiotherapy":    [{ key:"amenity", value:"physiotherapist" }],
  "chiropractor":     [{ key:"healthcare", value:"alternative" }],
  "veterinarian":     [{ key:"amenity", value:"veterinary" }],
  "vet":              [{ key:"amenity", value:"veterinary" }],
  "gym":              [{ key:"leisure", value:"fitness_centre" }],
  "fitness":          [{ key:"leisure", value:"fitness_centre" }],
  "personal trainer": [{ key:"leisure", value:"fitness_centre" }],
  "massage":          [{ key:"shop",    value:"massage" }],
  "accountant":       [{ key:"office",  value:"accountant" }, { key:"office", value:"tax_advisor" }],
  "accounting":       [{ key:"office",  value:"accountant" }],
  "bookkeeper":       [{ key:"office",  value:"accountant" }],
  "lawyer":           [{ key:"office",  value:"lawyer" }],
  "solicitor":        [{ key:"office",  value:"lawyer" }],
  "law firm":         [{ key:"office",  value:"lawyer" }],
  "architect":        [{ key:"office",  value:"architect" }],
  "surveyor":         [{ key:"office",  value:"surveyor" }],
  "real estate":      [{ key:"office",  value:"estate_agent" }],
  "realtor":          [{ key:"office",  value:"estate_agent" }],
  "insurance":        [{ key:"office",  value:"insurance" }],
  "financial advisor":[{ key:"office",  value:"financial" }],
  "restaurant":       [{ key:"amenity", value:"restaurant" }],
  "cafe":             [{ key:"amenity", value:"cafe" }],
  "coffee":           [{ key:"amenity", value:"cafe" }],
  "bakery":           [{ key:"shop",    value:"bakery" }],
  "pizza":            [{ key:"amenity", value:"fast_food" }],
  "takeaway":         [{ key:"amenity", value:"fast_food" }],
  "bar":              [{ key:"amenity", value:"bar" }],
  "pub":              [{ key:"amenity", value:"pub" }],
  "butcher":          [{ key:"shop",    value:"butcher" }],
  "salon":            [{ key:"shop",    value:"hairdresser" }, { key:"shop", value:"beauty" }],
  "hair salon":       [{ key:"shop",    value:"hairdresser" }],
  "hairdresser":      [{ key:"shop",    value:"hairdresser" }],
  "barbershop":       [{ key:"shop",    value:"hairdresser" }],
  "barber":           [{ key:"shop",    value:"hairdresser" }],
  "nail salon":       [{ key:"shop",    value:"beauty" }],
  "beauty":           [{ key:"shop",    value:"beauty" }],
  "tattoo":           [{ key:"shop",    value:"tattoo" }],
  "photographer":     [{ key:"shop",    value:"photo" }],
  "photography":      [{ key:"shop",    value:"photo" }],
  "tailor":           [{ key:"shop",    value:"tailor" }],
  "dry cleaner":      [{ key:"shop",    value:"dry_cleaning" }],
  "laundry":          [{ key:"shop",    value:"laundry" }],
  "travel agent":     [{ key:"shop",    value:"travel_agency" }],
  "pet shop":         [{ key:"shop",    value:"pet" }],
  "pet grooming":     [{ key:"shop",    value:"pet_grooming" }],
  "florist":          [{ key:"shop",    value:"florist" }],
  "jeweller":         [{ key:"shop",    value:"jewelry" }],
  "jewelry":          [{ key:"shop",    value:"jewelry" }],
  "printing":         [{ key:"shop",    value:"copyshop" }],
  "driving school":   [{ key:"amenity", value:"driving_school" }],
  "storage":          [{ key:"shop",    value:"storage_rental" }],
  "hotel":            [{ key:"tourism", value:"hotel" }],
  "motel":            [{ key:"tourism", value:"motel" }],
  "b&b":              [{ key:"tourism", value:"guest_house" }],
  "nursery":          [{ key:"amenity", value:"childcare" }],
  "childcare":        [{ key:"amenity", value:"childcare" }],
  "school":           [{ key:"amenity", value:"school" }],
  "tutor":            [{ key:"amenity", value:"school" }],
  "swimming":         [{ key:"leisure", value:"swimming_pool" }],
  "yoga":             [{ key:"leisure", value:"fitness_centre" }],
  "pilates":          [{ key:"leisure", value:"fitness_centre" }],
};

// ── Keyword → broader name search pattern (catches "Phoenix Electric" when searching "electrician") ──
const NAME_EXPANSIONS: Record<string, string[]> = {
  "electrician":  ["electric","electrical","electrician","wiring","power"],
  "electrical":   ["electric","electrical","electrician","wiring"],
  "electric":     ["electric","electrical","electrician"],
  "plumber":      ["plumb","pipe","drain","water works"],
  "plumbing":     ["plumb","pipe","drain"],
  "hvac":         ["hvac","heating","cooling","air condition","climate"],
  "heating":      ["heat","hvac","boiler","furnace"],
  "mechanic":     ["auto","motor","car repair","automotive","garage","vehicle"],
  "auto repair":  ["auto","motor","car repair","automotive","garage"],
  "car repair":   ["auto","motor","car repair","automotive","garage"],
  "dentist":      ["dental","dentist","smile","teeth","oral"],
  "dental":       ["dental","dentist","smile","oral"],
  "landscaper":   ["landscape","lawn","garden","yard","turf"],
  "landscaping":  ["landscape","lawn","garden","yard"],
  "painter":      ["paint","decor","coating"],
  "painting":     ["paint","decor","coating"],
  "roofing":      ["roof","roofer","shingle","tile"],
  "roofer":       ["roof","roofing","shingle"],
  "carpenter":    ["carpent","woodwork","joiner","cabinet","custom wood"],
  "carpentry":    ["carpent","woodwork","joiner"],
  "locksmith":    ["lock","key","security access"],
  "cleaning":     ["clean","maid","sparkle","janitorial"],
  "cleaner":      ["clean","maid","sparkle"],
  "pest":         ["pest","exterminat","bug","rodent"],
  "pest control": ["pest","exterminat","bug"],
  "accountant":   ["account","tax","bookkeep","cpa","financial"],
  "accounting":   ["account","tax","bookkeep","cpa"],
  "lawyer":       ["law","legal","attorney","solicitor","counsel"],
  "photographer": ["photo","studio","image","portrait"],
  "photography":  ["photo","studio","image"],
  "salon":        ["hair","beauty","salon","cut"],
  "hair salon":   ["hair","beauty","salon","cut","barber"],
  "barber":       ["barber","hair","cut","shave"],
  "gym":          ["gym","fitness","sport","health club","workout"],
  "fitness":      ["gym","fitness","sport","health"],
  "restaurant":   ["restaurant","grill","kitchen","diner","bistro","eatery"],
  "bakery":       ["bak","pastry","bread","cake"],
  "cafe":         ["cafe","coffee","espresso","brew"],
  "coffee":       ["coffee","cafe","espresso","brew"],
  "flooring":     ["floor","tile","hardwood","carpet"],
  "tiler":        ["tile","tiling","floor"],
  "glazier":      ["glass","glazier","window"],
  "window":       ["window","glass","glazier"],
  "surveyor":     ["survey","assess","inspect"],
  "architect":    ["architect","design","plan"],
  "real estate":  ["real estate","realt","propert","estate agent"],
  "insurance":    ["insurance","insur"],
  "physiotherapy":["physio","therapy","rehab"],
  "veterinarian": ["vet","animal","pet clinic"],
  "vet":          ["vet","animal","pet"],
  "tattoo":       ["tattoo","ink","piercing"],
  "florist":      ["florist","flower","bloom"],
  "jeweller":     ["jewel","jewelry","watch","gem"],
  "tailor":       ["tailor","alter","sew","stitch"],
  "storage":      ["storage","self-store","warehouse"],
  "driving school":["driving","driver","school"],
  "nursery":      ["nursery","childcare","daycare"],
  "tutor":        ["tutor","teach","coach","lesson"],
  "swimming":     ["swim","pool","aqua"],
  "yoga":         ["yoga","pilates","wellness","meditat"],
  "pilates":      ["pilates","yoga","fitness"],
};

/** Returns a regex-safe OR pattern for Overpass name search.
 *  E.g. "electrician" → "electric|electrical|electrician|wiring|power" */
function getNamePattern(keyword: string): string {
  const kw  = keyword.toLowerCase().trim();
  const exp = NAME_EXPANSIONS[kw];
  if (exp) return exp.join("|");
  // Partial match fallbacks
  for (const [k, terms] of Object.entries(NAME_EXPANSIONS)) {
    if (kw.includes(k) || k.includes(kw)) return terms.join("|");
  }
  // Generic: use first 5 non-space chars as prefix search
  const base = kw.replace(/[^a-z0-9]/gi, "").slice(0, 5);
  return base || kw;
}

function resolveOsmTags(keyword: string): OsmTag[] {
  const kw = keyword.toLowerCase().trim();
  if (OSM_MAP[kw]) return OSM_MAP[kw]!;
  for (const [k, tags] of Object.entries(OSM_MAP)) {
    if (kw.includes(k) || k.includes(kw)) return tags;
  }
  // Generic name search as last resort
  return [];
}

// Revenue estimate by category
function estimateRevenue(category: string, wsStatus: LocalBizLead["websiteStatus"]): string {
  const kw = category.toLowerCase();
  const base: Record<string, [number, number]> = {
    "plumber":     [800,  2500], "electrician": [800,  2500], "mechanic":    [1200, 3500],
    "dentist":     [2000, 6000], "lawyer":      [2500, 8000], "accountant":  [1500, 4000],
    "restaurant":  [1500, 4000], "hotel":       [3000, 8000], "gym":         [2000, 5000],
    "salon":       [600,  1800], "bakery":      [800,  2000], "cafe":        [1200, 3000],
    "doctor":      [2000, 5000], "clinic":      [2500, 6000], "vet":         [1500, 4000],
    "real estate": [2000, 6000], "photographer":[800,  2500], "painter":     [600,  2000],
    "carpenter":   [800,  2500], "roofer":      [1000, 3000], "landscaper":  [800,  2500],
  };
  for (const [k, [lo, hi]] of Object.entries(base)) {
    if (kw.includes(k)) {
      const mult = wsStatus === "none" ? 1 : 0.7;
      return `$${Math.round(lo * mult).toLocaleString()} – $${Math.round(hi * mult).toLocaleString()}`;
    }
  }
  return "$800 – $2,500";
}

// ── Geocoding (Nominatim) ──────────────────────────────────────────────────────
const geoCache = new Map<string, { bbox: BBox; ts: number }>();
interface BBox { south: number; north: number; west: number; east: number; lat: number; lon: number; }

export async function geocode(location: string): Promise<BBox | null> {
  const key = location.toLowerCase().trim();
  const hit = geoCache.get(key);
  if (hit && Date.now() - hit.ts < 24 * 3600_000) return hit.bbox;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=1`;
    const res  = await fetch(url, {
      headers: { "User-Agent": "iCloseLeads/2.0 (lead-discovery; hello@icloseleads.com)" },
      signal:  AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json() as Array<{ lat: string; lon: string; boundingbox: string[] }>;
    if (!data[0]) return null;
    const r   = data[0];
    const lat = Number(r.lat), lon = Number(r.lon);
    // Nominatim boundingbox = [south, north, west, east]
    const [s, n, w, e] = r.boundingbox.map(Number) as [number,number,number,number];
    // Use a generous pad so we cover the whole metro area (0.4° ≈ 44 km).
    // Large cities like LA, NYC, Chicago need at least this to return many results.
    const pad  = 0.4;
    const bbox: BBox = {
      south: Math.min(s, lat - pad), north: Math.max(n, lat + pad),
      west:  Math.min(w, lon - pad), east:  Math.max(e, lon + pad),
      lat, lon,
    };
    geoCache.set(key, { bbox, ts: Date.now() });
    return bbox;
  } catch { return null; }
}

// ── OSM Overpass ───────────────────────────────────────────────────────────────
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.karte.io/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];
let mIdx = 0;

interface OsmEl {
  type: string; id: number;
  lat?: number; lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function overpassFetch(ql: string): Promise<OsmEl[]> {
  const body = `data=${encodeURIComponent(ql)}`;
  for (let i = 0; i < MIRRORS.length; i++) {
    const mirror = MIRRORS[mIdx++ % MIRRORS.length]!;
    try {
      const res = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const json = await res.json() as { elements?: OsmEl[] };
      return json.elements ?? [];
    } catch { /* try next mirror */ }
  }
  return [];
}

// ── Photon (komoot) — free full-text OSM business search, no API key ─────────
// Returns real businesses with name, address, phone, website, email.
// Much better coverage than tag-only Overpass queries.
interface PhotonFeature {
  geometry: { coordinates: [number, number] }; // [lon, lat]
  properties: {
    osm_id?:          number;
    osm_type?:        string; // N, W, R
    osm_key?:         string;
    osm_value?:       string;
    name?:            string;
    street?:          string;
    housenumber?:     string;
    city?:            string;
    county?:          string;
    state?:           string;
    country?:         string;
    postcode?:        string;
    // Phone — OSM uses multiple tag conventions
    phone?:           string;
    "contact:phone"?: string;
    tel?:             string;
    // Website + email
    website?:         string;
    "contact:website"?: string;
    url?:             string;
    email?:           string;
    "contact:email"?: string;
    opening_hours?:   string;
    [key: string]:    unknown; // catch any extra OSM tags
  };
}

async function fetchFromPhoton(keyword: string, bbox: BBox): Promise<Partial<LocalBizLead>[]> {
  // Build search terms: primary keyword + first synonym (broader coverage)
  const exp   = NAME_EXPANSIONS[keyword.toLowerCase().trim()];
  const terms = exp ? [keyword, exp[0]!].filter((t, i, a) => t && a.indexOf(t) === i) : [keyword];

  const allFeatures: PhotonFeature[] = [];
  try {
    for (const term of terms.slice(0, 2)) { // max 2 requests
      const params = new URLSearchParams({
        q:      term,
        limit:  "100",
        lang:   "en",
        lat:    bbox.lat.toFixed(6),
        lon:    bbox.lon.toFixed(6),
      });
      const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
        headers: { "User-Agent": "iCloseLeads/2.0 (lead-discovery)" },
        signal:  AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const data = await res.json() as { features?: PhotonFeature[] };
      allFeatures.push(...(data.features ?? []));
    }
    if (allFeatures.length === 0) return [];

    // Deduplicate across term results by osm_id
    const seen = new Set<string>();
    const features = allFeatures.filter(f => {
      const key = `${f.properties.osm_type}-${f.properties.osm_id}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });

    // Use a generous distance filter (2× bbox size) — Photon is already location-biased
    const latSlack = (bbox.north - bbox.south) * 1.5;
    const lonSlack = (bbox.east  - bbox.west)  * 1.5;

    const results: Partial<LocalBizLead>[] = [];
    for (const f of features) {
      const p    = f.properties;
      const name = p.name?.trim();
      if (!name) continue;

      // Filter with generous slack
      const [lon, lat] = f.geometry.coordinates;
      if (lat < bbox.lat - latSlack || lat > bbox.lat + latSlack ||
          lon < bbox.lon - lonSlack || lon > bbox.lon + lonSlack) continue;

      const osmType = p.osm_type === "N" ? "node" : p.osm_type === "W" ? "way" : "relation";
      const street  = [p.housenumber, p.street].filter(Boolean).join(" ");
      const city    = p.city ?? p.county ?? "";
      const address = [street, city, p.postcode].filter(Boolean).join(", ");
      const website = (p.website ?? p["contact:website"] ?? p.url)?.trim() || undefined;
      const phone   = (p.phone ?? p["contact:phone"] ?? p.tel)?.trim() || undefined;
      const email   = (p.email ?? p["contact:email"])?.trim() || undefined;

      // Build a Google Maps business-name search URL so users land on the
      // actual business listing (with phone, hours, website, reviews) instead of
      // a bare OSM data page.
      results.push({
        id:      `photon-${osmType}-${p.osm_id ?? Math.random()}`,
        name,
        address: address || city || "Address not listed",
        city,
        country: p.country ?? "",
        lat, lon,
        phone,
        email,
        website,
        mapsUrl: googleMapsSearchUrl(name, address || city, p.country),
        osmId:   p.osm_id ? `${osmType}/${p.osm_id}` : undefined,
        source:  "osm" as const,
        category: p.osm_value ?? keyword,
      });
    }
    return results;
  } catch { return []; }
}

// ── Nominatim business search (extratags) — free, no API key ─────────────────
// Nominatim's text search returns OSM POIs with contact info when extratags=1.
interface NominatimBiz {
  place_id: number; osm_type?: string; osm_id?: number;
  lat: string; lon: string; display_name: string;
  address?: {
    house_number?: string; road?: string;
    city?: string; town?: string; village?: string;
    state?: string; country?: string; postcode?: string; country_code?: string;
  };
  extratags?: Record<string, string>;
  namedetails?: { name?: string };
}

async function fetchFromNominatim(keyword: string, location: string, bbox: BBox): Promise<Partial<LocalBizLead>[]> {
  try {
    const params = new URLSearchParams({
      q:            `${keyword} ${location}`,
      format:       "json",
      limit:        "100",
      addressdetails: "1",
      extratags:    "1",
      namedetails:  "1",
      "accept-language": "en",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/2.0 (lead-discovery; hello@icloseleads.com)" },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as NominatimBiz[];

    const results: Partial<LocalBizLead>[] = [];
    for (const b of data) {
      const name = b.namedetails?.name ?? b.display_name?.split(",")[0]?.trim() ?? "";
      if (!name || name.length < 2) continue;
      const lat = Number(b.lat), lon = Number(b.lon);
      // Skip non-businesses (roads, regions etc.)
      if (!b.extratags && (!b.osm_type || b.osm_type === "relation")) continue;

      const a       = b.address ?? {};
      const city    = a.city ?? a.town ?? a.village ?? "";
      const street  = [a.house_number, a.road].filter(Boolean).join(" ");
      const address = [street, city, a.postcode].filter(Boolean).join(", ");
      const ex      = b.extratags ?? {};
      const phone   = ex["phone"] ?? ex["contact:phone"] ?? ex["tel"] ?? undefined;
      const website = ex["website"] ?? ex["contact:website"] ?? ex["url"] ?? undefined;
      const email   = ex["email"]   ?? ex["contact:email"]   ?? undefined;
      const osmType = b.osm_type ?? "node";

      results.push({
        id:      `nom-${osmType}-${b.osm_id ?? b.place_id}`,
        name,
        address: address || city || "Address not listed",
        city,
        country: a.country ?? "",
        lat, lon,
        phone:   phone?.trim() || undefined,
        email:   email?.trim() || undefined,
        website: website?.trim() || undefined,
        mapsUrl: googleMapsSearchUrl(name, address || city, a.country),
        osmId:   b.osm_id ? `${osmType}/${b.osm_id}` : undefined,
        source:  "osm" as const,
      });
    }
    return results;
  } catch { return []; }
}

// ── OSM Overpass (tag-based + name-based) ─────────────────────────────────────
async function fetchFromOSM(keyword: string, bbox: BBox): Promise<Partial<LocalBizLead>[]> {
  const tags = resolveOsmTags(keyword);
  const { south, north, west, east } = bbox;
  const bboxStr = `${south.toFixed(6)},${west.toFixed(6)},${north.toFixed(6)},${east.toFixed(6)}`;

  // Build tag-based statements (precise matches)
  const tagStmts = tags.flatMap(t => [
    `node["${t.key}"="${t.value}"](${bboxStr});`,
    `way["${t.key}"="${t.value}"](${bboxStr});`,
  ]);

  // Name-based statements — uses expanded synonyms so "electrician" finds "Phoenix Electric Co" too
  const namePattern = getNamePattern(keyword);
  const nameStmts = namePattern ? [
    `node[name~"${namePattern}",i](${bboxStr});`,
    `way[name~"${namePattern}",i](${bboxStr});`,
  ] : [];

  const allStmts = [...tagStmts, ...nameStmts].join("\n  ");
  if (!allStmts.trim()) return [];

  const ql = `[out:json][timeout:30][maxsize:16000000];\n(\n  ${allStmts}\n);\nout center 100;`;
  const elements = await overpassFetch(ql);

  const results: Partial<LocalBizLead>[] = [];
  for (const el of elements) {
    const t    = el.tags ?? {};
    const name = t["name"] ?? t["brand"] ?? "";
    if (!name) continue;
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    const street  = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
    const city    = t["addr:city"] ?? t["addr:town"] ?? t["addr:village"] ?? "";
    const address = [street, city, t["addr:postcode"]].filter(Boolean).join(", ");
    const website = (t["website"] ?? t["contact:website"] ?? t["url"] ?? "").trim() || undefined;
    const phone   = (t["phone"] ?? t["contact:phone"] ?? t["contact:mobile"] ?? t["mobile"] ?? t["tel"] ?? "").trim() || undefined;
    results.push({
      id:       `osm-${el.type}-${el.id}`,
      name, address: address || city || "Address not listed", city,
      country:  t["addr:country"] ?? "",
      lat, lon,
      phone,
      email:    (t["email"] ?? t["contact:email"] ?? "").trim() || undefined,
      website,
      mapsUrl:  googleMapsSearchUrl(name, address || city, t["addr:country"]),
      osmId:    `${el.type}/${el.id}`,
      source:   "osm" as const,
    });
  }
  return results;
}

// ── Foursquare Places API v3 (free 1,000 calls/day, global, has phones) ───────
interface FoursquareBiz {
  fsq_id:     string;
  name:       string;
  tel?:       string;
  website?:   string;
  rating?:    number;
  stats?:     { total_ratings?: number };
  categories?: Array<{ name: string; short_name?: string }>;
  geocodes?:  { main?: { latitude: number; longitude: number } };
  location?:  {
    formatted_address?: string;
    address?: string;
    locality?: string;
    region?: string;
    country?: string;
    postcode?: string;
  };
  hours?:     { open_now?: boolean };
}

async function fetchFromFoursquare(keyword: string, bbox: BBox, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    // Foursquare v3 places/search — use ll + radius for tight geo targeting
    const radiusM = Math.round(
      Math.min(
        Math.max((bbox.north - bbox.south) * 111_000 * 0.6, 5_000),
        50_000
      )
    );
    const params = new URLSearchParams({
      query:  keyword,
      ll:     `${bbox.lat.toFixed(6)},${bbox.lon.toFixed(6)}`,
      radius: String(radiusM),
      limit:  "50",
      fields: "fsq_id,name,tel,website,rating,stats,categories,geocodes,location,hours",
    });
    const res = await fetch(`https://api.foursquare.com/v3/places/search?${params.toString()}`, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
        "X-Places-Api-Version": "1970-01-01",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { results?: FoursquareBiz[] };
    return (data.results ?? []).map(b => {
      const loc     = b.location ?? {};
      const coords  = b.geocodes?.main;
      const city    = loc.locality ?? loc.region ?? "";
      const address = loc.formatted_address ?? [loc.address, city, loc.postcode].filter(Boolean).join(", ");
      const cat     = b.categories?.[0]?.name?.toLowerCase() ?? keyword;
      return {
        id:          `fsq-${b.fsq_id}`,
        name:         b.name,
        phone:        b.tel?.trim() || undefined,
        website:      b.website?.trim() || undefined,
        address,
        city,
        country:      loc.country ?? "",
        lat:          coords?.latitude,
        lon:          coords?.longitude,
        rating:       b.rating ? Math.round((b.rating / 10) * 5 * 10) / 10 : undefined, // FSQ uses 0–10
        reviewCount:  b.stats?.total_ratings,
        category:     cat,
        mapsUrl:      googleMapsSearchUrl(b.name, address),
        isOpen:       b.hours?.open_now,
        source:       "foursquare" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── TomTom Places API (free 2,500 calls/day, global, great EU/ME coverage) ────
interface TomTomResult {
  id: string; type: string;
  poi?: { name?: string; phone?: string; url?: string; categories?: Array<{ name: string }> };
  address?: { freeformAddress?: string; municipality?: string; countryCode?: string; country?: string };
  position?: { lat: number; lon: number };
  openingHours?: { open: boolean };
  score?: number;
}

async function fetchFromTomTom(keyword: string, bbox: BBox, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    // keyword goes in the URL path — do NOT add it as 'query' param too
    const params = new URLSearchParams({
      key:    apiKey,
      lat:    bbox.lat.toFixed(6),
      lon:    bbox.lon.toFixed(6),
      radius: String(Math.round(Math.min((bbox.north - bbox.south) * 111_000 * 0.6, 50_000))),
      limit:  "100",
      view:   "Unified",
    });
    const res = await fetch(`https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(keyword)}.json?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { results?: TomTomResult[] };
    return (data.results ?? []).filter(r => r.poi?.name).map(r => {
      const city    = r.address?.municipality ?? "";
      const address = r.address?.freeformAddress ?? city;
      const name    = r.poi?.name ?? "";
      return {
        id:       `ttom-${r.id}`,
        name,
        phone:    r.poi?.phone?.trim() || undefined,
        website:  r.poi?.url?.trim()   || undefined,
        address,
        city,
        country:  r.address?.country ?? r.address?.countryCode ?? "",
        lat:      r.position?.lat,
        lon:      r.position?.lon,
        category: r.poi?.categories?.[0]?.name?.toLowerCase() ?? keyword,
        mapsUrl:  googleMapsSearchUrl(name, address),
        isOpen:   r.openingHours?.open,
        source:   "osm" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── Geoapify Places API (free 3,000 calls/day, global) ────────────────────────
interface GeoapifyFeature {
  properties: {
    place_id?: string; name?: string;
    formatted?: string; city?: string; country?: string; country_code?: string;
    lat?: number; lon?: number;
    datasource?: { properties?: { phone?: string; website?: string; opening_hours?: string } };
    categories?: string[];
  };
  geometry?: { coordinates?: [number, number] };
}

async function fetchFromGeoapify(keyword: string, bbox: BBox, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    // Geoapify /v2/places requires category codes, not text.
    // Use /v1/geocode/search with type=amenity for free-text business search.
    const city = ""; // geocode search handles location via bbox bias
    const params = new URLSearchParams({
      text:   keyword,
      type:   "amenity",
      filter: `rect:${bbox.west.toFixed(6)},${bbox.south.toFixed(6)},${bbox.east.toFixed(6)},${bbox.north.toFixed(6)}`,
      bias:   `proximity:${bbox.lon.toFixed(6)},${bbox.lat.toFixed(6)}`,
      limit:  "50",
      lang:   "en",
      apiKey,
    });
    void city; // suppress unused warning
    const res = await fetch(`https://api.geoapify.com/v1/geocode/search?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { features?: GeoapifyFeature[] };
    return (data.features ?? []).filter(f => f.properties.name).map(f => {
      const p    = f.properties;
      const ds   = p.datasource?.properties ?? {};
      const name = p.name ?? "";
      const city = p.city ?? "";
      return {
        id:       `geoapify-${p.place_id ?? Math.random()}`,
        name,
        phone:    ds.phone?.trim() || undefined,
        website:  ds.website?.trim() || undefined,
        address:  p.formatted ?? city,
        city,
        country:  p.country ?? p.country_code ?? "",
        lat:      p.lat ?? f.geometry?.coordinates?.[1],
        lon:      p.lon ?? f.geometry?.coordinates?.[0],
        category: keyword,
        mapsUrl:  googleMapsSearchUrl(name, p.formatted ?? city),
        source:   "osm" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── Radar.io Places (free 100k/month, global POI data) ───────────────────────
interface RadarPlace {
  _id?: string; name?: string;
  location?: { coordinates?: [number, number] };
  address?: { street?: string; city?: string; state?: string; country?: string; formattedAddress?: string };
  categories?: string[];
}

async function fetchFromRadar(keyword: string, bbox: BBox, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    const params = new URLSearchParams({
      near:    `${bbox.lat.toFixed(6)},${bbox.lon.toFixed(6)}`,
      radius:  String(Math.round(Math.min((bbox.north - bbox.south) * 111_000 * 0.6, 50_000))),
      query:   keyword,
      limit:   "100",
    });
    const res = await fetch(`https://api.radar.io/v1/search/places?${params.toString()}`, {
      headers: { Authorization: apiKey },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { places?: RadarPlace[] };
    return (data.places ?? []).filter(p => p.name).map(p => {
      const name    = p.name ?? "";
      const city    = p.address?.city ?? "";
      const address = p.address?.formattedAddress ?? city;
      const [lon, lat] = p.location?.coordinates ?? [];
      return {
        id:       `radar-${p._id ?? Math.random()}`,
        name,
        address,
        city,
        country:  p.address?.country ?? "",
        lat, lon,
        category: p.categories?.[0]?.toLowerCase() ?? keyword,
        mapsUrl:  googleMapsSearchUrl(name, address),
        source:   "osm" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── Bing Local Search (free 10k transactions/month) ───────────────────────────
interface BingLocalResult {
  name?: string;
  url?: string;
  telephone?: string;
  address?: { addressLocality?: string; addressCountry?: string; streetAddress?: string };
  geo?: { latitude?: number; longitude?: number };
  aggregateRating?: { ratingValue?: number; reviewCount?: number };
}

async function fetchFromBing(keyword: string, bbox: BBox, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    const params = new URLSearchParams({
      q:       keyword,
      localCircularView: `${bbox.lat.toFixed(6)},${bbox.lon.toFixed(6)},${Math.round(Math.min((bbox.north - bbox.south) * 111_000 * 0.5, 50_000))}`,
      count:   "25",
      mkt:     "en-US",
    });
    const res = await fetch(`https://api.bing.microsoft.com/v7.0/localbusinesses/search?${params.toString()}`, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { places?: { value?: BingLocalResult[] } };
    return (data.places?.value ?? []).filter(b => b.name).map(b => {
      const name    = b.name ?? "";
      const city    = b.address?.addressLocality ?? "";
      const street  = b.address?.streetAddress ?? "";
      const address = [street, city].filter(Boolean).join(", ");
      return {
        id:          `bing-${Math.random().toString(36).slice(2,10)}`,
        name,
        phone:       b.telephone?.trim() || undefined,
        website:     b.url?.trim()       || undefined,
        address,
        city,
        country:     b.address?.addressCountry ?? "",
        lat:         b.geo?.latitude,
        lon:         b.geo?.longitude,
        rating:      b.aggregateRating?.ratingValue,
        reviewCount: b.aggregateRating?.reviewCount,
        category:    keyword,
        mapsUrl:     googleMapsSearchUrl(name, address),
        source:      "osm" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── UK Companies House (free, unlimited, official registry) ───────────────────
interface CompaniesHouseItem {
  company_number?: string;
  title?: string;
  company_status?: string;
  company_type?: string;
  address_snippet?: string;
  registered_office_address?: {
    address_line_1?: string; address_line_2?: string;
    locality?: string; postal_code?: string; country?: string;
  };
}

async function fetchFromCompaniesHouse(keyword: string, location: string, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  // Only run for UK-related searches
  const lcLoc = location.toLowerCase();
  if (!lcLoc.includes("uk") && !lcLoc.includes("england") && !lcLoc.includes("scotland") &&
      !lcLoc.includes("wales") && !lcLoc.includes("london") && !lcLoc.includes("manchester") &&
      !lcLoc.includes("birmingham") && !lcLoc.includes("leeds") && !lcLoc.includes("glasgow") &&
      !lcLoc.includes("bristol") && !lcLoc.includes("sheffield") && !lcLoc.includes("liverpool") &&
      !lcLoc.includes("edinburgh") && !lcLoc.includes("belfast") && !lcLoc.includes("cardiff")) {
    return [];
  }
  try {
    const params = new URLSearchParams({
      q:       `${keyword} ${location.split(",")[0] ?? ""}`.trim(),
      items_per_page: "50",
      restrictions: "active-companies",
    });
    const creds = Buffer.from(`${apiKey}:`).toString("base64");
    const res = await fetch(`https://api.company-information.service.gov.uk/search/companies?${params.toString()}`, {
      headers: { Authorization: `Basic ${creds}` },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { items?: CompaniesHouseItem[] };
    return (data.items ?? [])
      .filter(c => c.company_status === "active" && c.title)
      .map(c => {
        const addr = c.registered_office_address ?? {};
        const city = addr.locality ?? "";
        const address = [addr.address_line_1, addr.address_line_2, city, addr.postal_code].filter(Boolean).join(", ");
        const name  = c.title ?? "";
        return {
          id:       `ch-${c.company_number ?? Math.random()}`,
          name,
          address: address || "Registered address on file",
          city,
          country: addr.country ?? "United Kingdom",
          category: keyword,
          mapsUrl:  googleMapsSearchUrl(name, city),
          // Companies House doesn't return phone/website — but gives us real registered businesses
          source:   "osm" as const,
        } satisfies Partial<LocalBizLead>;
      });
  } catch { return []; }
}

// ── France SIRENE / Recherche-Entreprises (100% free, no key, official govt) ──
// recherche-entreprises.api.gouv.fr — all French registered businesses
interface SireneEtablissement {
  siret?: string; siren?: string;
  nom_complet?: string; nom_raison_sociale?: string;
  activite_principale?: string;
  siege?: {
    adresse?: string; commune?: string; code_postal?: string;
    libelle_commune?: string; longitude?: number; latitude?: number;
  };
  tranche_effectif_salarie?: string;
  etat_administratif?: string; // "A" = active
}

async function fetchFromSirene(keyword: string, location: string): Promise<Partial<LocalBizLead>[]> {
  // Only run for French locations
  const lcLoc = location.toLowerCase();
  if (!lcLoc.includes("france") && !lcLoc.includes("paris") && !lcLoc.includes("lyon") &&
      !lcLoc.includes("marseille") && !lcLoc.includes("toulouse") && !lcLoc.includes("nice") &&
      !lcLoc.includes("nantes") && !lcLoc.includes("bordeaux") && !lcLoc.includes("strasbourg") &&
      !lcLoc.includes("montpellier") && !lcLoc.includes("rennes") && !lcLoc.includes("lille")) {
    return [];
  }
  try {
    const city = location.split(",")[0]?.trim() ?? location;
    const params = new URLSearchParams({
      q:        `${keyword} ${city}`,
      per_page: "25",
      etat:     "A", // active only
    });
    const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/2.0 (lead-discovery; hello@icloseleads.com)" },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { results?: SireneEtablissement[] };
    return (data.results ?? [])
      .filter(e => e.etat_administratif === "A" && (e.nom_complet || e.nom_raison_sociale))
      .map(e => {
        const name    = e.nom_complet ?? e.nom_raison_sociale ?? "";
        const siege   = e.siege ?? {};
        const city2   = siege.libelle_commune ?? siege.commune ?? city;
        const address = [siege.adresse, siege.code_postal, city2].filter(Boolean).join(", ");
        return {
          id:       `sirene-${e.siret ?? e.siren ?? Math.random()}`,
          name,
          address: address || city2,
          city:    city2,
          country: "France",
          lat:     siege.latitude  ?? undefined,
          lon:     siege.longitude ?? undefined,
          category: e.activite_principale?.toLowerCase() ?? keyword,
          mapsUrl:  googleMapsSearchUrl(name, city2, "France"),
          source:   "osm" as const,
        } satisfies Partial<LocalBizLead>;
      });
  } catch { return []; }
}

// ── Australia ABN / ASIC (free, requires one-time GUID from abr.gov.au) ────────
// Note: ABN Lookup requires a free GUID — add ABR_GUID to .env.local after
// registering at: https://abr.business.gov.au/Tools/WebServices
async function fetchFromABN(keyword: string, location: string, guid: string): Promise<Partial<LocalBizLead>[]> {
  const lcLoc = location.toLowerCase();
  if (!lcLoc.includes("australia") && !lcLoc.includes("sydney") && !lcLoc.includes("melbourne") &&
      !lcLoc.includes("brisbane") && !lcLoc.includes("perth") && !lcLoc.includes("adelaide") &&
      !lcLoc.includes("canberra") && !lcLoc.includes("gold coast") && !lcLoc.includes("darwin")) {
    return [];
  }
  try {
    const city = location.split(",")[0]?.trim() ?? location;
    const params = new URLSearchParams({
      name:              `${keyword} ${city}`,
      guid,
      legalName:         "Y",
      tradingName:       "Y",
      NSW: "Y", VIC: "Y", ACT: "Y", SA: "Y", WA: "Y", NT: "Y", QLD: "Y", TAS: "Y",
      authenticationGuid: guid,
    });
    const res = await fetch(`https://abr.business.gov.au/json/MatchingNames.aspx?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/2.0" },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    // ABR returns JSONP-like: callback({...}) — strip wrapper
    const text = await res.text();
    const json = text.replace(/^callback\(/, "").replace(/\)$/, "");
    const data = JSON.parse(json) as { names?: Array<{ name?: string; abn?: string; state?: string }> };
    return (data.names ?? []).filter(b => b.name).map(b => {
      const name = b.name ?? "";
      return {
        id:       `abn-${b.abn ?? Math.random()}`,
        name,
        address:  city,
        city,
        country:  "Australia",
        category: keyword,
        mapsUrl:  googleMapsSearchUrl(name, city, "Australia"),
        source:   "osm" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── OpenCorporates (free 500 req/month no key, worldwide registered companies) ─
interface OCCompany {
  company: {
    name?: string; company_number?: string; jurisdiction_code?: string;
    current_status?: string; registered_address?: { in_full?: string; locality?: string; country?: string };
    registered_address_in_full?: string;
  };
}

// Map common country name fragments to OpenCorporates jurisdiction codes
const OC_JURISDICTION_MAP: Record<string, string> = {
  uk: "gb", "united kingdom": "gb", england: "gb", scotland: "gb", wales: "gb",
  us: "us", usa: "us", "united states": "us",
  australia: "au", canada: "ca", france: "fr", germany: "de",
  spain: "es", italy: "it", netherlands: "nl", belgium: "be",
  poland: "pl", portugal: "pt", switzerland: "ch", sweden: "se",
  norway: "no", denmark: "dk", finland: "fi", ireland: "ie",
  "new zealand": "nz", singapore: "sg", india: "in",
};

function getJurisdiction(location: string): string | null {
  const lc = location.toLowerCase();
  for (const [fragment, code] of Object.entries(OC_JURISDICTION_MAP)) {
    if (lc.includes(fragment)) return code;
  }
  return null;
}

async function fetchFromOpenCorporates(keyword: string, location: string): Promise<Partial<LocalBizLead>[]> {
  try {
    const jurisdiction = getJurisdiction(location);
    const city         = location.split(",")[0]?.trim() ?? location;
    const params       = new URLSearchParams({
      q:          keyword,
      per_page:   "30",
      normalise_company_name: "true",
      ...(jurisdiction ? { jurisdiction_code: jurisdiction } : {}),
    });
    const res = await fetch(`https://api.opencorporates.com/v0.4/companies/search?${params.toString()}`, {
      headers: { "User-Agent": "iCloseLeads/2.0 (lead-discovery; hello@icloseleads.com)" },
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    // Real OC response: { "results": { "companies": [ { "company": {...} } ] } }
    // company.company_status (not current_status) — varies by jurisdiction
    const data = await res.json() as { results?: { companies?: OCCompany[] } };
    return (data.results?.companies ?? [])
      .filter(c => {
        const status = (c.company.current_status ?? "").toLowerCase();
        return c.company.name && (status === "active" || status === "" || status === "registered");
      })
      .map(c => {
        const co      = c.company;
        const name    = co.name ?? "";
        const address = co.registered_address?.in_full ?? co.registered_address_in_full ?? city;
        const bizCity = co.registered_address?.locality ?? city;
        const country = co.registered_address?.country ?? location.split(",").pop()?.trim() ?? "";
        return {
          id:       `oc-${co.company_number ?? Math.random()}`,
          name,
          address,
          city:    bizCity,
          country,
          category: keyword,
          mapsUrl:  googleMapsSearchUrl(name, bizCity),
          source:   "osm" as const,
        } satisfies Partial<LocalBizLead>;
      });
  } catch { return []; }
}

// ── Yelp Fusion API (free 500 calls/day) ──────────────────────────────────────
interface YelpBiz {
  id: string; name: string; phone?: string; url?: string; image_url?: string;
  rating?: number; review_count?: number; categories?: Array<{ title: string }>;
  location?: { display_address?: string[]; city?: string; country?: string };
  coordinates?: { latitude?: number; longitude?: number };
  is_closed?: boolean;
}

async function fetchFromYelp(keyword: string, location: string, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    const params = new URLSearchParams({
      term: keyword, location, limit: "50", sort_by: "rating",
    });
    const res = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { businesses?: YelpBiz[] };
    return (data.businesses ?? []).map(b => ({
      id:          `yelp-${b.id}`,
      name:         b.name,
      phone:        (b.phone && b.phone.replace(/\D/g,"").length > 7) ? b.phone : undefined,
      address:      b.location?.display_address?.join(", ") ?? "",
      city:         b.location?.city ?? "",
      country:      b.location?.country ?? "",
      lat:          b.coordinates?.latitude,
      lon:          b.coordinates?.longitude,
      website:      undefined,           // Yelp search doesn't return website URL
      yelpUrl:      b.url,
      mapsUrl:      googleMapsSearchUrl(b.name, b.location?.display_address?.join(", "), b.location?.city, b.location?.country),
      rating:       b.rating,
      reviewCount:  b.review_count,
      category:     b.categories?.[0]?.title?.toLowerCase() ?? keyword,
      imageUrl:     b.image_url,
      source:       "yelp" as const,
      isOpen:       b.is_closed === false ? true : undefined,
    } satisfies Partial<LocalBizLead>));
  } catch { return []; }
}

// ── HERE Discover API (free 250k/month) ───────────────────────────────────────
interface HereBiz {
  id: string; title: string; position?: { lat: number; lng: number };
  address?: { label?: string; city?: string; countryName?: string; countryCode?: string };
  contacts?: Array<{
    phone?: Array<{ value: string }>;
    www?: Array<{ value: string }>;
    email?: Array<{ value: string }>;
  }>;
  categories?: Array<{ name?: string }>;
  openingHours?: Array<{ isOpen?: boolean }>;
  references?: Array<{ supplier?: { id?: string }; id?: string }>;
}

async function fetchFromHERE(keyword: string, bbox: BBox, apiKey: string): Promise<Partial<LocalBizLead>[]> {
  try {
    const params = new URLSearchParams({
      q:     keyword,
      in:    `bbox:${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
      limit: "50",
      apiKey,
    });
    const res = await fetch(`https://discover.search.hereapi.com/v1/discover?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { items?: HereBiz[] };
    return (data.items ?? []).map(b => {
      const contact = b.contacts?.[0];
      const phone   = contact?.phone?.[0]?.value;
      const website = contact?.www?.[0]?.value;
      const email   = contact?.email?.[0]?.value;
      return {
        id:       `here-${b.id}`,
        name:      b.title,
        address:   b.address?.label ?? "",
        city:      b.address?.city ?? "",
        country:   b.address?.countryName ?? b.address?.countryCode ?? "",
        lat:       b.position?.lat,
        lon:       b.position?.lng,
        phone,
        email,
        website,
        mapsUrl:   b.title && b.address?.city
          ? googleMapsSearchUrl(b.title, b.address.label ?? b.address.city)
          : googleMapsSearchUrl(b.title),
        category:  b.categories?.[0]?.name?.toLowerCase() ?? keyword,
        isOpen:    b.openingHours?.[0]?.isOpen,
        source:    "here" as const,
      } satisfies Partial<LocalBizLead>;
    });
  } catch { return []; }
}

// ── Smart demo data (realistic, keyword + location aware) ─────────────────────
const TRADES: Record<string, string[]> = {
  "mechanic":     ["Auto Repair","Car Service","Motors","Automotive","Auto Centre","Garage"],
  "plumber":      ["Plumbing","Pipes","Flow","Drain","Water Works","Plumbing Co"],
  "electrician":  ["Electric","Electrical","Power","Wiring","Spark","Electric Co"],
  "dentist":      ["Dental","Smile","Teeth","Oral Care","Dental Care","Family Dental"],
  "bakery":       ["Bakery","Baked Goods","Pastry","Bread","Sweet","Artisan Bread"],
  "salon":        ["Hair","Beauty","Cuts","Style","Salon","Beauty Bar"],
  "restaurant":   ["Grill","Kitchen","Bistro","Diner","Eatery","House"],
  "lawyer":       ["Law Firm","Legal","Attorneys","Counsel","Law Group","Associates"],
  "accountant":   ["Accounting","Tax","Financial","CPA","Bookkeeping","Advisory"],
  "landscaper":   ["Landscaping","Gardens","Green","Lawn","Outdoor","Yard Care"],
  "painter":      ["Painting","Paint","Decor","Interior","Coatings","Brush"],
  "carpenter":    ["Carpentry","Woodwork","Joinery","Craft","Custom Wood","Build"],
  "locksmith":    ["Lock","Key","Security","Access","Safe","Lock & Key"],
  "cleaner":      ["Cleaning","Clean","Sparkle","Fresh","Maid","Cleaning Co"],
  "photographer": ["Photography","Photos","Studio","Images","Capture","Vision"],
  "roofer":       ["Roofing","Roof","Tile","Cover","Shelter","Roof Works"],
  "hvac":         ["Heating","Cooling","HVAC","Climate","Air","Comfort"],
};

function getDemoSuffixes(keyword: string): string[] {
  const kw = keyword.toLowerCase();
  for (const [k, v] of Object.entries(TRADES)) {
    if (kw.includes(k) || k.includes(kw)) return v;
  }
  return ["Services","Solutions","Co","Group","Works","Pro"];
}

const PHONE_PREFIXES: Record<string,string> = {
  canada:    "+1 (416)","toronto":   "+1 (416)","vancouver": "+1 (604)",
  calgary:   "+1 (403)","montreal":  "+1 (514)",
  australia: "+61 4","sydney":     "+61 2","melbourne":"+61 3","brisbane":"+61 7",
  uk:        "+44 20","london":    "+44 20","manchester":"+44 161",
  usa:       "+1 (312)","chicago":  "+1 (312)","los angeles":"+1 (213)",
  "new york":"+1 (212)","houston": "+1 (713)","dallas":"+1 (214)",
};

function getPhonePrefix(location: string): string {
  const lc = location.toLowerCase();
  for (const [k, v] of Object.entries(PHONE_PREFIXES)) {
    if (lc.includes(k)) return v;
  }
  return "+1 (555)";
}

function generateDemoLeads(keyword: string, location: string, count = 18): Partial<LocalBizLead>[] {
  const suffixes = getDemoSuffixes(keyword);
  const prefix   = getPhonePrefix(location);
  const city     = location.split(",")[0]?.trim() ?? location;
  const leads: Partial<LocalBizLead>[] = [];

  // Distribution: ~60% no website, ~25% outdated, ~15% has website
  const scenarios: Array<{ website?: string; status: LocalBizLead["websiteStatus"]; rating: number; reviews: number }> = [
    { website: undefined,          status: "none",       rating: 4.2, reviews: 47  },
    { website: undefined,          status: "none",       rating: 3.8, reviews: 23  },
    { website: undefined,          status: "none",       rating: 4.7, reviews: 112 },
    { website: undefined,          status: "none",       rating: 4.0, reviews: 31  },
    { website: undefined,          status: "none",       rating: 3.5, reviews: 67  },
    { website: undefined,          status: "none",       rating: 4.5, reviews: 89  },
    { website: undefined,          status: "none",       rating: 4.1, reviews: 15  },
    { website: undefined,          status: "none",       rating: 3.9, reviews: 42  },
    { website: undefined,          status: "none",       rating: 4.3, reviews: 28  },
    { website: undefined,          status: "none",       rating: 4.6, reviews: 156 },
    { website: `http://old-${keyword.replace(/\s/g,"-")}.weebly.com`, status:"outdated", rating:3.7, reviews:19 },
    { website: `http://www.${keyword.replace(/\s/g,"")}-local.wix.com/site`, status:"outdated", rating:4.0, reviews:33 },
    { website: `http://${keyword.replace(/\s/g,"")}-${city.toLowerCase().replace(/\s/g,"")}.yolasite.com`, status:"outdated", rating:3.6, reviews:8 },
    { website: `http://www.${keyword.replace(/\s/g,"")}services.net`, status:"unreachable", rating:3.4, reviews:5 },
    { website: `http://${keyword.replace(/\s/g,"")}-pro.com`, status:"unreachable", rating:4.2, reviews:11 },
    { website: `https://www.${keyword.replace(/\s/g,"")}${city.toLowerCase().replace(/\s/g,"")}.com`, status:"alive", rating:4.5, reviews:203 },
    { website: `https://www.local${keyword.replace(/\s/g,"")}s.com`, status:"alive", rating:4.3, reviews:87  },
    { website: `https://www.${keyword.replace(/\s/g,"")}experts.com`,  status:"alive", rating:4.8, reviews:315 },
  ];

  for (let i = 0; i < count; i++) {
    const sc     = scenarios[i % scenarios.length]!;
    const suffix = suffixes[i % suffixes.length]!;
    const randN  = (100 + i * 37) % 900 + 100;
    const randS  = (200 + i * 53) % 9000 + 1000;
    const streetName = ["Main St","Oak Ave","Elm Rd","King St","Queen St","Park Ave","Maple Dr","First Ave","Church St","Bay St"][i % 10]!;
    leads.push({
      id:       `demo-${i}-${Date.now()}`,
      name:     `${city} ${suffix} ${i > 5 ? "" : "#" + (i + 1)}`.trim().replace("  "," "),
      address:  `${randN} ${streetName}, ${city}`,
      city,
      country:  location.split(",").slice(-1)[0]?.trim() ?? "",
      phone:    `${prefix} ${String(randS).slice(0,3)}-${String(randS).slice(3)}`,
      website:  sc.website,
      mapsUrl:  googleMapsSearchUrl(keyword, city),
      rating:   sc.rating,
      reviewCount: sc.reviews,
      category: keyword,
      source:   "demo" as const,
    });
  }
  return leads;
}

// ── Website validation ─────────────────────────────────────────────────────────
const OUTDATED_HOSTS = ["weebly.com","yolasite.com","wix.com/site/","tripod.com","angelfire.com","geocities.com","freewebs.com","jimdo.com/","moonfruit.com"];
const OUTDATED_TECH: Array<[RegExp, string]> = [
  [/Apache\/2\.[012]\./i,     "Old Apache server"],
  [/PHP\/[45]\./i,            "Old PHP 5.x"],
  [/WordPress\/[1234]\./i,    "Old WordPress"],
  [/Drupal [67]/i,            "Old Drupal"],
  [/Joomla! [12]\./i,         "Old Joomla"],
  [/ASP\.NET MVC [123]/i,     "Old ASP.NET"],
  [/IIS\/[678]\./i,           "Old IIS server"],
];

interface WebInfo { status: "alive"|"outdated"|"unreachable"; age?: string; tech?: string; phone?: string; }

// Phone number regex patterns — matches most US/CA/UK/AU/intl formats
const PHONE_RE = [
  /(?:tel(?:ephone)?|phone|call us|contact)[:\s]*([+\d][\d\s().–\-]{7,18}\d)/gi,
  /\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,   // +1 (555) 555-5555
  /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g,                 // (555) 555-5555
  /\+44[\s.-]?\d{4}[\s.-]?\d{6}/g,                      // UK +44
  /\+61[\s.-]?[2-9]\d{8}/g,                              // AU +61
  /\+\d{1,3}[\s.-]?\d{6,14}/g,                           // generic intl
];

function extractPhoneFromHtml(html: string): string | null {
  // Pull raw text from <body>, strip tags
  const body = html.replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");

  // Try contextual patterns first (label before number = most reliable)
  const ctx = PHONE_RE[0]!;
  ctx.lastIndex = 0;
  let m = ctx.exec(body);
  if (m?.[1]) {
    const digits = m[1].replace(/\D/g, "");
    if (digits.length >= 10) return m[1].trim();
  }

  // Try raw number patterns
  for (const re of PHONE_RE.slice(1)) {
    re.lastIndex = 0;
    const hit = re.exec(body);
    if (hit?.[0]) {
      const digits = hit[0].replace(/\D/g, "");
      if (digits.length >= 10) return hit[0].trim();
    }
  }

  // Also look for tel: links
  const telLink = /<a[^>]+href=["']tel:([^"']+)["']/i.exec(html);
  if (telLink?.[1]) return decodeURIComponent(telLink[1]);

  return null;
}

async function checkWebsite(url: string): Promise<WebInfo> {
  const lc = url.toLowerCase();
  for (const h of OUTDATED_HOSTS) { if (lc.includes(h)) return { status: "outdated", tech: "Outdated website builder" }; }
  try {
    // Use GET so we can also scrape phone numbers from the HTML
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; iCloseLeads/2.0)" },
      signal:  AbortSignal.timeout(3500),
      redirect: "follow",
    });
    if (r.status >= 400) return { status: "unreachable" };

    const sv  = r.headers.get("server") ?? "";
    const xp  = r.headers.get("x-powered-by") ?? "";
    const lm  = r.headers.get("last-modified");
    const all = `${sv} ${xp}`;
    for (const [re, label] of OUTDATED_TECH) { if (re.test(all)) return { status: "outdated", tech: label }; }

    // Try to get HTML for phone extraction (skip huge responses)
    let phone: string | undefined;
    const ct = r.headers.get("content-type") ?? "";
    if (ct.includes("html")) {
      try {
        const raw   = await r.text();
        const found = extractPhoneFromHtml(raw.slice(0, 80_000)); // first 80KB
        if (found) phone = found;

        // Still check last-modified from HTML meta if no header
        if (!lm) {
          const metaLm = /<meta[^>]+name=["']?last-modified["']?[^>]+content=["']?([^"'>]+)/i.exec(raw);
          if (metaLm?.[1]) {
            const yrs = (Date.now() - new Date(metaLm[1]).getTime()) / (365 * 24 * 3600_000);
            if (yrs >= 3) return { status: "outdated", age: `${Math.floor(yrs)}+ years old`, phone };
          }
        }
      } catch { /* body read failed — not critical */ }
    }

    if (lm) {
      const yrs = (Date.now() - new Date(lm).getTime()) / (365 * 24 * 3600_000);
      if (yrs >= 3) return { status: "outdated", age: `${Math.floor(yrs)}+ years old`, phone };
    }
    return { status: "alive", phone };
  } catch { return { status: "unreachable" }; }
}

function quickWebsiteStatus(url: string): WebInfo | null {
  const lc = url.toLowerCase();
  for (const h of OUTDATED_HOSTS) {
    if (lc.includes(h)) return { status: "outdated", tech: "Outdated website builder" };
  }
  return null;
}

const GENERIC_NAME_TOKENS = new Set([
  "the", "and", "for", "with", "from", "near", "local", "best", "top",
  "service", "services", "company", "business", "group", "team", "pros",
  "pro", "llc", "inc", "ltd", "co", "corp", "corporation", "residential",
  "commercial", "professional", "solutions", "center", "centre",
]);

function tokeniseBusinessName(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 4 && !GENERIC_NAME_TOKENS.has(t));
}

function domainStem(url: string): string {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, "");
    return host.split(".").slice(0, -1).join("").replace(/[^a-z0-9]/g, "");
  } catch {
    return url.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]!.split(".").slice(0, -1).join("").replace(/[^a-z0-9]/g, "");
  }
}

function websiteMatchesBusinessName(name: string | undefined, website: string | undefined): boolean {
  if (!name || !website) return false;
  const stem = domainStem(website);
  if (stem.length < 4) return false;
  const tokens = tokeniseBusinessName(name);
  if (tokens.length === 0) return false;
  return tokens.some(token => stem.includes(token) || token.includes(stem));
}

function shouldTrustWebsiteForLead(raw: Partial<LocalBizLead>): boolean {
  if (!raw.website) return false;
  if (raw.source && raw.source !== "osm") return true;
  return websiteMatchesBusinessName(raw.name, raw.website);
}

// ── Email pattern generator ────────────────────────────────────────────────────
export function guessEmails(domain: string | undefined): string[] {
  if (!domain) return [];
  const d = domain
    .replace(/^https?:\/\//i, "")
    .split("/")[0]!
    .toLowerCase()
    .trim()
    .replace(/^www\./, "");
  if (!d || d.length < 4) return [];
  return [`info@${d}`, `contact@${d}`, `hello@${d}`, `admin@${d}`];
}

// ── Pitch generator ────────────────────────────────────────────────────────────
function buildCallScript(
  name: string,
  category: string,
  wsStatus: LocalBizLead["websiteStatus"],
  opportunityType: LocalBizLead["opportunityType"],
): string {
  const businessName = name || "your business";
  const businessType = category || "local business";

  if (wsStatus === "none" || wsStatus === "unknown" || opportunityType === "no_website") {
    return `Hi, this is [Your name]. Is this the right person for ${businessName}'s website or marketing? I found you while checking local ${businessType} options and could not find a clear website on the business profile. That can make it harder for mobile searchers to see services, photos, and request a quote. I help fix that quickly. Can I send a short example?`;
  }

  if (wsStatus === "outdated" || wsStatus === "unreachable" || opportunityType === "outdated_website") {
    return `Hi, this is [Your name]. Who handles the website for ${businessName}? I noticed the site may be dated or hard to reach on mobile. I help local ${businessType} businesses make quick fixes that turn visitors into calls, bookings, or quote requests. Would you be open to a short screen recording with the three fixes I would prioritize?`;
  }

  if (opportunityType === "seo") {
    return `Hi, this is [Your name]. Is this the owner or manager for ${businessName}? I was checking local ${businessType} searches and saw a few ways you could show up stronger in Google and Maps, mainly clearer service pages, reviews, and conversion buttons. Can I send a quick local visibility checklist?`;
  }

  return `Hi, this is [Your name]. Who handles website enquiries for ${businessName}? I saw you already have an online presence, so this is not a basic website call. I noticed a few conversion improvements that could make it easier for visitors to call or request a quote. Can I send a quick mini-audit?`;
}

function buildPitch(
  name: string, category: string, wsStatus: LocalBizLead["websiteStatus"],
  webInfo: WebInfo | null, revenueEst: string, opportunityType: LocalBizLead["opportunityType"],
): Pick<LocalBizLead,"pitchPoints"|"pitchSubject"|"pitchOpener"|"callScript"> {

  if (wsStatus === "none") {
    return {
      pitchSubject: `Getting more customers for ${name} — quick question`,
      pitchOpener:  `Hi, I noticed ${name} doesn't have a website yet. In today's market, 97% of people search online before choosing a local ${category} — without a site, those searches go straight to competitors. I specialise in affordable websites for ${category} businesses and can have you live within a week.`,
      callScript: buildCallScript(name, category, wsStatus, opportunityType),
      pitchPoints: [
        `97% of consumers search online before contacting a local ${category}`,
        `${name} is invisible to anyone Googling "${category} near me" right now`,
        `A simple site with your services, photos & contact form → real phone calls`,
        `Google Business profile + website = 3× more visibility in local search`,
        `One new customer from Google pays for the website multiple times over`,
        `Potential project value for you: ${revenueEst}`,
      ],
    };
  }

  if (wsStatus === "outdated" || wsStatus === "unreachable") {
    const detail = webInfo?.tech ? `(running ${webInfo.tech})` : webInfo?.age ? `(${webInfo.age})` : "(needs a refresh)";
    return {
      pitchSubject: `Quick idea to bring more customers to ${name}`,
      pitchOpener:  `Hi, I had a look at ${name}'s website ${detail} and spotted a few quick fixes that could bring in noticeably more customers from Google — especially mobile searches, which now account for over 60% of local queries.`,
      callScript: buildCallScript(name, category, wsStatus, opportunityType),
      pitchPoints: [
        `Outdated sites rank lower in Google's mobile-first index — costing you visibility`,
        `62% of local searches happen on phones — old sites lose these visitors immediately`,
        `A modern redesign with clear "Call Now" + booking buttons can double enquiries`,
        `Add before/after photos, reviews showcase & service list to build instant trust`,
        `Local SEO improvements to rank for "${category} near me" searches`,
        `Potential project value: ${revenueEst}`,
      ],
    };
  }

  return {
    pitchSubject: `Boosting ${name}'s Google visibility — quick idea`,
    pitchOpener:  `Hi, I came across ${name} online and spotted a few improvements that could bring in noticeably more customers — especially from local "near me" searches where most of your competitors aren't fully optimised yet.`,
    callScript: buildCallScript(name, category, wsStatus, opportunityType),
    pitchPoints: [
      `Local SEO to rank on page 1 for "${category} near me" in your area`,
      `Core Web Vitals optimisation — Google's speed ranking signals`,
      `Schema markup to show star ratings directly in search results`,
      `Google Business integration to boost Maps and local pack visibility`,
      `Conversion rate improvements — more site visitors → actual phone calls`,
    ],
  };
}

// ── Groq pitch enhancer (free tier) ───────────────────────────────────────────
async function enhanceWithAI(lead: LocalBizLead, groqKey: string): Promise<void> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role:"system", content:"You write high-converting cold email pitches for freelance web developers. Be direct, specific, and human. Return JSON only." },
          { role:"user",   content:`Business: ${lead.name}\nType: ${lead.category}\nCity: ${lead.city}\nWebsite situation: ${lead.websiteStatus==="none"?"NO WEBSITE":lead.websiteStatus==="outdated"?`Outdated site (${lead.websiteTech??lead.websiteAge??"old"})`:"Has website, needs improvement"}\nRevenue opportunity: ${lead.revenueEst??""}\n\nReturn: {"subject":"under 10 words","opener":"2-3 sentences, sound human, under 70 words","points":["specific point 1","specific point 2","specific point 3","specific point 4"]}` },
        ],
        temperature: 0.7, max_tokens: 350, response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return;
    const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const p = JSON.parse(d.choices?.[0]?.message?.content ?? "{}") as { subject?:string; opener?:string; points?:string[] };
    if (p.subject)        lead.pitchSubject = p.subject;
    if (p.opener)         lead.pitchOpener  = p.opener;
    if (p.points?.length) lead.pitchPoints  = p.points;
  } catch { /* fallback to template */ }
}

// ── Lead scorer ────────────────────────────────────────────────────────────────
function scoreLead(lead: LocalBizLead): number {
  let s = 50;
  if (lead.websiteStatus === "none")        s = 95;
  if (lead.websiteStatus === "unreachable") s = 82;
  if (lead.websiteStatus === "outdated")    s = 72;
  if (lead.websiteStatus === "alive")       s = 35;
  if (lead.phone)          s += 4;
  if (lead.email)          s += 3;
  if (lead.guessedEmails?.length) s += 2;
  if (lead.rating && lead.rating >= 4) s += 3;
  if (lead.reviewCount && lead.reviewCount > 50) s += 2;
  if (lead.source === "yelp") s += 5; // Yelp data more reliable
  if (lead.source === "here") s += 3;
  return Math.min(100, s);
}

// ── Deduplication ──────────────────────────────────────────────────────────────
function dedup(leads: Partial<LocalBizLead>[]): Partial<LocalBizLead>[] {
  const seen = new Set<string>();
  return leads.filter(l => {
    if (!l.name) return false;
    const key = `${l.name.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,20)}-${(l.city??"").toLowerCase().slice(0,10)}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}

// ── Cache ──────────────────────────────────────────────────────────────────────
const MEM = new Map<string, { data: LocalBizLead[]; ts: number }>();
const TTL = 24 * 3600_000;

async function cacheGet(key: string, db: import("@prisma/client").PrismaClient): Promise<LocalBizLead[] | null> {
  const hit = MEM.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;
  try {
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "LocalLeadCache" (id TEXT PRIMARY KEY, "cacheKey" TEXT UNIQUE, data TEXT, "createdAt" TEXT)`).catch(()=>{});
    const rows = await db.$queryRawUnsafe<Array<{ data: string; createdAt: string }>>(
      `SELECT data, "createdAt" FROM "LocalLeadCache" WHERE "cacheKey" = $1 LIMIT 1`, key
    );
    if (rows[0]) {
      const age = Date.now() - new Date(rows[0].createdAt).getTime();
      if (age < TTL) {
        const parsed = JSON.parse(rows[0].data) as LocalBizLead[];
        MEM.set(key, { data: parsed, ts: Date.now() - age });
        return parsed;
      }
    }
  } catch { /* non-fatal */ }
  return null;
}

async function cacheSet(key: string, data: LocalBizLead[], db: import("@prisma/client").PrismaClient) {
  MEM.set(key, { data, ts: Date.now() });
  try {
    const id = `llc-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await db.$executeRawUnsafe(
      `INSERT INTO "LocalLeadCache" (id,"cacheKey",data,"createdAt") VALUES($1,$2,$3,$4) ON CONFLICT("cacheKey") DO UPDATE SET data=EXCLUDED.data,"createdAt"=EXCLUDED."createdAt"`,
      id, key, JSON.stringify(data), new Date().toISOString()
    );
    // Also record the search for cache warming
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "LocalLeadSearchLog" (id TEXT PRIMARY KEY, "searchKey" TEXT UNIQUE, keyword TEXT, location TEXT, "lastSearched" TEXT)`).catch(()=>{});
    await db.$executeRawUnsafe(
      `INSERT INTO "LocalLeadSearchLog" (id,"searchKey",keyword,location,"lastSearched") VALUES($1,$2,$3,$4,$5) ON CONFLICT("searchKey") DO UPDATE SET "lastSearched"=EXCLUDED."lastSearched"`,
      `sl-${Date.now()}`, key, data[0]?.category ?? key.split("-")[0] ?? "unknown", data[0]?.city ?? "unknown", new Date().toISOString()
    ).catch(()=>{});
  } catch { /* non-fatal */ }
}

// ── Rate limiter ───────────────────────────────────────────────────────────────
const RL = new Map<string, number[]>();
export function checkRateLimit(userId: string, max = 20): boolean {
  const now  = Date.now();
  const wins = (RL.get(userId) ?? []).filter(t => now - t < 3600_000);
  if (wins.length >= max) return false;
  wins.push(now);
  RL.set(userId, wins);
  return true;
}

// Shorthand for empty resolved promise (keeps parallel Promise.all tidy)
const P = (v: Partial<LocalBizLead>[]) => Promise.resolve(v);

// ── Main search ────────────────────────────────────────────────────────────────
export interface SearchOpts {
  keyword: string; location: string;
  filter: "all" | "no_website" | "outdated_website" | "has_website";
  limit?: number; userId: string; groqKey?: string;
  yelpKey?: string; hereKey?: string; foursquareKey?: string;
  tomtomKey?: string; geoapifyKey?: string; radarKey?: string;
  bingKey?: string; companiesHouseKey?: string; abnGuid?: string;
  cacheScope?: string;
  db: import("@prisma/client").PrismaClient;
}

export interface SearchResult {
  leads: LocalBizLead[]; source: "cache"|"live"; total: number;
  geocoded: boolean; sources: string[]; cacheKey: string;
}

export async function searchLocalBusinesses(opts: SearchOpts): Promise<SearchResult> {
  const {
    keyword, location, filter, groqKey,
    yelpKey, hereKey, foursquareKey,
    tomtomKey, geoapifyKey, radarKey, bingKey, companiesHouseKey, abnGuid,
    cacheScope,
    db,
  } = opts;
  const limit    = Math.min(opts.limit ?? 60, 80);
  // v7 - add small-operator business scale signals to cached local lead payloads.
  const sourceScope = cacheScope ?? "default";
  const cacheKey = `v7-${sourceScope}-${keyword.toLowerCase().trim()}-${location.toLowerCase().trim()}-${filter}`;

  // 1. Cache check — instant return
  const cached = await cacheGet(cacheKey, db);
  if (cached) return { leads: applyFilter(cached, filter), source:"cache", total: applyFilter(cached,filter).length, geocoded:true, sources:["cache"], cacheKey };

  // 2. Geocode location
  const bbox = await geocode(location);

  // 3. Run all sources in parallel (graceful degradation — any failure is non-fatal)
  const [
    yelpRaw, hereRaw, fsqRaw, tomtomRaw, geoapifyRaw, radarRaw, bingRaw,
    chRaw, sireneRaw, abnRaw, ocRaw,
    photonRaw, nominatimRaw, osmRaw,
  ] = await Promise.all([
    yelpKey               ? fetchFromYelp(keyword, location, yelpKey)                     : P([]),
    (hereKey && bbox)     ? fetchFromHERE(keyword, bbox, hereKey)                         : P([]),
    (foursquareKey && bbox) ? fetchFromFoursquare(keyword, bbox, foursquareKey)           : P([]),
    (tomtomKey && bbox)   ? fetchFromTomTom(keyword, bbox, tomtomKey)                     : P([]),
    (geoapifyKey && bbox) ? fetchFromGeoapify(keyword, bbox, geoapifyKey)                 : P([]),
    (radarKey && bbox)    ? fetchFromRadar(keyword, bbox, radarKey)                       : P([]),
    (bingKey && bbox)     ? fetchFromBing(keyword, bbox, bingKey)                         : P([]),
    companiesHouseKey     ? fetchFromCompaniesHouse(keyword, location, companiesHouseKey) : P([]),
    // Free, no key required:
    fetchFromSirene(keyword, location),          // France only, auto-skips other countries
    abnGuid ? fetchFromABN(keyword, location, abnGuid) : P([]), // Australia, needs free GUID
    fetchFromOpenCorporates(keyword, location),  // Global registered companies
    bbox ? fetchFromPhoton(keyword, bbox) : P([]),
    fetchFromNominatim(keyword, location, bbox ?? { south:0, north:90, west:-180, east:180, lat:0, lon:0 }),
    bbox ? fetchFromOSM(keyword, bbox) : P([]),
  ]);

  const sourcesUsed: string[] = [];
  if (yelpRaw.length)      sourcesUsed.push("yelp");
  if (hereRaw.length)      sourcesUsed.push("here");
  if (fsqRaw.length)       sourcesUsed.push("foursquare");
  if (tomtomRaw.length)    sourcesUsed.push("tomtom");
  if (geoapifyRaw.length)  sourcesUsed.push("geoapify");
  if (radarRaw.length)     sourcesUsed.push("radar");
  if (bingRaw.length)      sourcesUsed.push("bing");
  if (chRaw.length)        sourcesUsed.push("companies-house");
  if (sireneRaw.length)    sourcesUsed.push("sirene");
  if (abnRaw.length)       sourcesUsed.push("abn");
  if (ocRaw.length)        sourcesUsed.push("opencorporates");
  if (photonRaw.length)    sourcesUsed.push("photon");
  if (nominatimRaw.length) sourcesUsed.push("nominatim");
  if (osmRaw.length)       sourcesUsed.push("osm");

  // Merge: phone-rich sources first so dedup keeps the richer record
  let merged = dedup([
    ...yelpRaw, ...fsqRaw, ...tomtomRaw, ...bingRaw, ...hereRaw,
    ...geoapifyRaw, ...radarRaw,
    ...chRaw, ...sireneRaw, ...abnRaw, ...ocRaw,
    ...photonRaw, ...nominatimRaw, ...osmRaw,
  ]);

  // If fewer than 5 results, try a wider bbox (3× radius) for sparse areas
  if (merged.length < 5 && bbox) {
    const wideBbox: BBox = {
      south: bbox.lat - 0.6, north: bbox.lat + 0.6,
      west:  bbox.lon - 0.8, east:  bbox.lon + 0.8,
      lat: bbox.lat, lon: bbox.lon,
    };
    const widePhoton = await fetchFromPhoton(keyword, wideBbox);
    if (widePhoton.length > 0) {
      merged = dedup([...merged, ...widePhoton]);
      if (!sourcesUsed.includes("photon")) sourcesUsed.push("photon");
    }
  }

  // No demo fallback — return real results only (even if empty).
  // If 0 results: the UI shows a clear "no real data found" message.

  // 4. Validate websites in bounded batches.
  // Local lead searches must feel reliable in production; one slow website or
  // Overpass mirror should not turn the whole page into a vague network error.
  const BATCH = 16;
  const websiteStartedAt = Date.now();
  const websiteBudgetMs = filter === "outdated_website" ? 14_000 : 7_000;
  const maxWebsiteChecks = filter === "outdated_website" ? 64 : 28;
  let websiteChecks = 0;
  const leads: LocalBizLead[] = [];

  const mergedForValidation = merged.slice(0, Math.max(limit, maxWebsiteChecks, 80));
  for (let i = 0; i < mergedForValidation.length; i += BATCH) {
    const batch = mergedForValidation.slice(i, i + BATCH);
    const validated = await Promise.all(
      batch.map(async (raw) => {
        let webInfo: WebInfo | null = null;
        let wsStatus: LocalBizLead["websiteStatus"] = "unknown";
        const trustedWebsite = shouldTrustWebsiteForLead(raw) ? raw.website : undefined;

        if (raw.websiteStatus && raw.websiteStatus !== "unknown") {
          // Demo data or pre-enriched source has explicit status
          wsStatus = raw.websiteStatus;
        } else if (trustedWebsite) {
          const quickStatus = quickWebsiteStatus(trustedWebsite);
          if (quickStatus) {
            webInfo = quickStatus;
            wsStatus = quickStatus.status;
          } else if (
            websiteChecks < maxWebsiteChecks &&
            Date.now() - websiteStartedAt < websiteBudgetMs
          ) {
            websiteChecks += 1;
            webInfo  = await checkWebsite(trustedWebsite).catch(() => null);
            wsStatus = webInfo?.status ?? "alive";
          } else {
            // When the deadline is exhausted, keep the lead usable instead of
            // blocking the full search. Users can still open/verify the profile.
            wsStatus = "alive";
          }
        } else {
          // Only mark "none" if from a rich source that reliably stores website data.
          // OSM/Photon/Nominatim rarely store website URLs, so absence of a URL
          // does NOT mean the business has no website — it just means OSM doesn't
          // know about it. Mark as "unknown" to avoid false "No Website" badges.
          const richSource = raw.source === "yelp" || raw.source === "here" || raw.source === "foursquare";
          wsStatus = richSource ? "none" : "unknown";
        }

        const cat    = (raw.category ?? keyword).toLowerCase();
        const revEst = estimateRevenue(cat, wsStatus);
        const guEmails = guessEmails(trustedWebsite);

        const opType: LocalBizLead["opportunityType"] =
          wsStatus === "none"       ? "no_website" :
          wsStatus === "unreachable"|| wsStatus === "outdated" ? "outdated_website" :
          wsStatus === "alive"      ? "seo" : "modernise";

        const { pitchPoints, pitchSubject, pitchOpener, callScript } = buildPitch(
          raw.name ?? "this business", cat, wsStatus, webInfo, revEst, opType
        );

        // Use phone from OSM data; fall back to number scraped from the website
        const resolvedPhone = raw.phone ?? webInfo?.phone ?? undefined;

        const lead: LocalBizLead = {
          id:              raw.id ?? `lead-${i}-${Date.now()}`,
          name:            raw.name ?? "",
          address:         raw.address ?? "",
          city:            raw.city ?? "",
          country:         raw.country ?? "",
          lat:             raw.lat,
          lon:             raw.lon,
          phone:           resolvedPhone,
          email:           raw.email,
          guessedEmails:   raw.email ? [] : guEmails,
          website:         trustedWebsite,
          websiteStatus:   wsStatus,
          websiteAge:      webInfo?.age,
          websiteTech:     webInfo?.tech,
          mapsUrl:         raw.mapsUrl ?? googleMapsSearchUrl(raw.name, raw.address, raw.city, raw.country),
          yelpUrl:         raw.yelpUrl,
          rating:          raw.rating,
          reviewCount:     raw.reviewCount,
          category:        cat,
          categoryLabel:   cat.charAt(0).toUpperCase() + cat.slice(1),
          source:          raw.source ?? "osm",
          osmId:           raw.osmId,
          isOpen:          raw.isOpen,
          imageUrl:        raw.imageUrl,
          revenueEst:      revEst,
          pitchPoints,
          pitchSubject,
          pitchOpener,
          callScript,
          opportunityType: opType,
          score:           0,
          urgency:         "medium",
        };
        const scaleSignal = businessScaleSignal(lead);
        lead.businessScale = scaleSignal.businessScale;
        lead.businessScaleScore = scaleSignal.businessScaleScore;
        lead.businessScaleReasons = scaleSignal.businessScaleReasons;
        lead.score   = scoreLead(lead);
        lead.urgency = lead.score >= 85 ? "high" : lead.score >= 65 ? "medium" : "low";
        return lead;
      })
    );
    leads.push(...validated.filter(l => l.name));
  }

  // 5. AI enhancement for top 8 no-website leads
  if (groqKey) {
    const topLeads = leads
      .filter(l => l.opportunityType === "no_website" || l.opportunityType === "outdated_website")
      .sort((a,b) => b.score - a.score)
      .slice(0, 8);
    await Promise.race([
      Promise.allSettled(topLeads.map(l => enhanceWithAI(l, groqKey))),
      new Promise(resolve => setTimeout(resolve, 4_000)),
    ]);
  }

  // 6. Sort by score
  leads.sort((a,b) => b.score - a.score);

  // 7. Cache (only cache when we have real results — never cache empty)
  if (leads.length > 0) await cacheSet(cacheKey, leads, db);

  const filtered = applyFilter(leads, filter);
  return { leads: filtered, source:"live", total: filtered.length, geocoded: !!bbox, sources: sourcesUsed, cacheKey };
}

function applyFilter(leads: LocalBizLead[], filter: string): LocalBizLead[] {
  if (filter === "no_website")       return leads.filter(l => l.websiteStatus === "none" || l.websiteStatus === "unknown");
  if (filter === "outdated_website") return leads.filter(l => l.websiteStatus === "outdated" || l.websiteStatus === "unreachable");
  if (filter === "has_website")      return leads.filter(l => l.websiteStatus === "alive");
  return leads;
}
