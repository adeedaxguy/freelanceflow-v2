export type DesignStyle = "professional" | "premium" | "bold" | "friendly" | "minimal" | "creative";
export type DesignTheme = "dark" | "light";
export type DesignImages = "abstract" | "gallery" | "before-after" | "none";
export type DesignDepth = "short" | "balanced" | "detailed";
export type DesignGoal = "calls" | "quotes" | "bookings" | "visits";
export type DesignLayout = "conversion" | "editorial" | "showcase";
export type DesignSections = "5" | "7" | "9" | "11";

export type SiteDesignVariation = {
  id: string;
  label: string;
  summary: string;
  badge: string;
  rhythm: string;
  texture: string;
  keywords: string[];
  style: DesignStyle;
  theme: DesignTheme;
  sections: DesignSections;
  images: DesignImages;
  contentDepth: DesignDepth;
  conversionGoal: DesignGoal;
  layout: DesignLayout;
  palette: {
    accent: string;
    accent2: string;
    accentSoft: string;
    previewBackground: string;
    previewSurface: string;
  };
};

type Archetype = {
  id: string;
  label: string;
  summary: string;
  badge: string;
  rhythm: string;
  keywords: string[];
  style: DesignStyle;
  theme: DesignTheme;
  sections: DesignSections;
  images: DesignImages;
  contentDepth: DesignDepth;
  conversionGoal: DesignGoal;
  layout: DesignLayout;
};

type Motif = {
  id: string;
  label: string;
  texture: string;
  keywords: string[];
  theme?: DesignTheme;
  palette: SiteDesignVariation["palette"];
};

const ARCHETYPES: Archetype[] = [
  {
    id: "local-authority",
    label: "Local Authority",
    summary: "Trust-first local service page with practical proof, visible contact paths, and clear service categories.",
    badge: "Trusted local choice",
    rhythm: "steady, proof-led, easy to scan",
    keywords: ["trust", "credible", "established", "reviews", "local", "professional", "contractor", "repair", "medical", "legal"],
    style: "professional",
    theme: "dark",
    sections: "7",
    images: "gallery",
    contentDepth: "balanced",
    conversionGoal: "quotes",
    layout: "conversion",
  },
  {
    id: "boutique-studio",
    label: "Boutique Studio",
    summary: "High-end spacing, restrained typography, and calm premium proof for higher-ticket local services.",
    badge: "Premium local brand",
    rhythm: "quiet, premium, editorial",
    keywords: ["premium", "luxury", "high end", "elegant", "studio", "salon", "spa", "interior", "boutique"],
    style: "premium",
    theme: "light",
    sections: "9",
    images: "gallery",
    contentDepth: "detailed",
    conversionGoal: "bookings",
    layout: "showcase",
  },
  {
    id: "urgent-response",
    label: "Urgent Response",
    summary: "Phone-first page for repair, emergency, and same-day services where speed matters.",
    badge: "Fast response",
    rhythm: "direct, bold, action-heavy",
    keywords: ["urgent", "emergency", "same day", "fast", "call", "plumber", "locksmith", "hvac", "roof", "auto"],
    style: "bold",
    theme: "dark",
    sections: "7",
    images: "before-after",
    contentDepth: "balanced",
    conversionGoal: "calls",
    layout: "conversion",
  },
  {
    id: "neighborhood-warmth",
    label: "Neighborhood Warmth",
    summary: "Friendly family-run feel with human service language, local cues, and approachable proof.",
    badge: "Neighbourhood favourite",
    rhythm: "warm, human, reassuring",
    keywords: ["family", "friendly", "neighborhood", "neighbourhood", "warm", "local feel", "cleaning", "cafe", "bakery"],
    style: "friendly",
    theme: "light",
    sections: "7",
    images: "gallery",
    contentDepth: "balanced",
    conversionGoal: "bookings",
    layout: "conversion",
  },
  {
    id: "editorial-craft",
    label: "Editorial Craft",
    summary: "Magazine-like service storytelling for businesses that need to feel thoughtful and distinctive.",
    badge: "Craft story",
    rhythm: "story-led, spacious, memorable",
    keywords: ["editorial", "story", "craft", "artisan", "brand", "photography", "designer", "creative"],
    style: "creative",
    theme: "light",
    sections: "9",
    images: "abstract",
    contentDepth: "detailed",
    conversionGoal: "quotes",
    layout: "editorial",
  },
  {
    id: "minimal-signal",
    label: "Minimal Signal",
    summary: "Stripped-back homepage for customers who need the offer, proof, and contact path immediately.",
    badge: "Clean and fast",
    rhythm: "minimal, direct, low friction",
    keywords: ["minimal", "simple", "clean", "fast", "no clutter", "straight", "modern"],
    style: "minimal",
    theme: "light",
    sections: "5",
    images: "none",
    contentDepth: "short",
    conversionGoal: "quotes",
    layout: "conversion",
  },
  {
    id: "visual-portfolio",
    label: "Visual Portfolio",
    summary: "Visual-first layout for work examples, transformations, food, beauty, repairs, and before-after proof.",
    badge: "Show the work",
    rhythm: "visual, proof-heavy, confident",
    keywords: ["portfolio", "gallery", "photos", "before after", "transformation", "show work", "restaurant", "beauty"],
    style: "creative",
    theme: "dark",
    sections: "9",
    images: "gallery",
    contentDepth: "balanced",
    conversionGoal: "quotes",
    layout: "showcase",
  },
  {
    id: "high-ticket-consult",
    label: "High-Ticket Consult",
    summary: "Consultative positioning for premium B2B, specialty, clinic, advisory, and high-value local offers.",
    badge: "Consultation-ready",
    rhythm: "premium, calm, authority-led",
    keywords: ["consultation", "advisor", "clinic", "specialist", "b2b", "high value", "premium", "estimate"],
    style: "premium",
    theme: "dark",
    sections: "11",
    images: "abstract",
    contentDepth: "detailed",
    conversionGoal: "quotes",
    layout: "editorial",
  },
  {
    id: "founder-led",
    label: "Founder-Led",
    summary: "Human owner-led story with trust cues, local identity, and a warmer sales path.",
    badge: "Owner-led service",
    rhythm: "personal, credible, community-led",
    keywords: ["owner", "founder", "family owned", "independent", "small business", "personal", "team"],
    style: "friendly",
    theme: "light",
    sections: "7",
    images: "gallery",
    contentDepth: "balanced",
    conversionGoal: "calls",
    layout: "editorial",
  },
  {
    id: "modern-service-app",
    label: "Modern Service App",
    summary: "Contemporary app-like homepage with crisp cards, strong CTAs, and productized service packaging.",
    badge: "Modern service flow",
    rhythm: "crisp, structured, conversion-led",
    keywords: ["modern", "app", "digital", "booking", "online", "dashboard", "tech", "startup", "saas"],
    style: "bold",
    theme: "dark",
    sections: "9",
    images: "abstract",
    contentDepth: "balanced",
    conversionGoal: "bookings",
    layout: "showcase",
  },
];

const MOTIFS: Motif[] = [
  {
    id: "obsidian-neon",
    label: "Obsidian Neon",
    texture: "dark depth, cyan edge light, neon CTA accents",
    keywords: ["dark", "black", "neon", "tech", "night", "premium dark"],
    theme: "dark",
    palette: {
      accent: "#38bdf8",
      accent2: "#a78bfa",
      accentSoft: "rgba(56,189,248,0.22)",
      previewBackground: "#070b12",
      previewSurface: "#0d1424",
    },
  },
  {
    id: "ivory-calm",
    label: "Ivory Calm",
    texture: "soft light surfaces, calm gradients, editorial whitespace",
    keywords: ["light", "white", "airy", "calm", "elegant", "clean"],
    theme: "light",
    palette: {
      accent: "#7c3aed",
      accent2: "#14b8a6",
      accentSoft: "rgba(124,58,237,0.16)",
      previewBackground: "#f8fafc",
      previewSurface: "#ffffff",
    },
  },
  {
    id: "solar-action",
    label: "Solar Action",
    texture: "warm urgency, amber proof blocks, high-contrast conversion sections",
    keywords: ["warm", "orange", "urgent", "bold", "fast", "energy"],
    palette: {
      accent: "#f97316",
      accent2: "#facc15",
      accentSoft: "rgba(249,115,22,0.18)",
      previewBackground: "#0f0b08",
      previewSurface: "#1f1309",
    },
  },
  {
    id: "alpine-trust",
    label: "Alpine Trust",
    texture: "clean blue-green trust palette with practical service cards",
    keywords: ["trust", "blue", "green", "medical", "finance", "professional", "reliable"],
    palette: {
      accent: "#0ea5e9",
      accent2: "#10b981",
      accentSoft: "rgba(14,165,233,0.18)",
      previewBackground: "#08111f",
      previewSurface: "#0d1b2e",
    },
  },
  {
    id: "rose-local",
    label: "Rose Local",
    texture: "friendly pink-coral accents for human, neighbourhood-first businesses",
    keywords: ["friendly", "pink", "rose", "salon", "beauty", "family", "cafe"],
    palette: {
      accent: "#f472b6",
      accent2: "#fb923c",
      accentSoft: "rgba(244,114,182,0.18)",
      previewBackground: "#120817",
      previewSurface: "#1d1024",
    },
  },
];

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function normalize(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function scoreTerms(haystack: string, terms: string[]) {
  return terms.reduce((score, term) => score + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0);
}

export const DESIGN_VARIATIONS: SiteDesignVariation[] = ARCHETYPES.flatMap(archetype =>
  MOTIFS.map(motif => ({
    id: `${archetype.id}-${motif.id}`,
    label: `${archetype.label} / ${motif.label}`,
    summary: `${archetype.summary} Visual feel: ${motif.texture}.`,
    badge: archetype.badge,
    rhythm: archetype.rhythm,
    texture: motif.texture,
    keywords: [...archetype.keywords, ...motif.keywords],
    style: archetype.style,
    theme: motif.theme ?? archetype.theme,
    sections: archetype.sections,
    images: archetype.images,
    contentDepth: archetype.contentDepth,
    conversionGoal: archetype.conversionGoal,
    layout: archetype.layout,
    palette: motif.palette,
  })),
);

export function getDesignVariation(id?: string) {
  const normalized = normalize(id);
  return DESIGN_VARIATIONS.find(variation => variation.id === normalized);
}

export function resolveDesignVariation({
  variationId,
  prompt = "",
  company = "",
  category = "",
  location = "",
}: {
  variationId?: string;
  prompt?: string;
  company?: string;
  category?: string;
  location?: string;
} = {}) {
  const explicit = getDesignVariation(variationId);
  if (explicit) return explicit;

  const haystack = normalize(`${prompt} ${company} ${category} ${location}`);
  if (!haystack) return DESIGN_VARIATIONS[0]!;

  let best = DESIGN_VARIATIONS[stableHash(haystack) % DESIGN_VARIATIONS.length]!;
  let bestScore = 0;

  for (const variation of DESIGN_VARIATIONS) {
    const score = scoreTerms(haystack, variation.keywords);
    if (score > bestScore) {
      best = variation;
      bestScore = score;
    }
  }

  return best;
}

export function nextDesignVariationId(currentId: string, seed: string) {
  const currentIndex = Math.max(0, DESIGN_VARIATIONS.findIndex(variation => variation.id === currentId));
  const jump = (stableHash(seed) % 17) + 3;
  return DESIGN_VARIATIONS[(currentIndex + jump) % DESIGN_VARIATIONS.length]!.id;
}

export function variationToOptionPatch(variation: SiteDesignVariation) {
  return {
    style: variation.style,
    theme: variation.theme,
    sections: variation.sections,
    images: variation.images,
    contentDepth: variation.contentDepth,
    conversionGoal: variation.conversionGoal,
    layout: variation.layout,
  };
}
