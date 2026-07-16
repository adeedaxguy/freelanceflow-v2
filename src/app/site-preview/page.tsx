import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Layers,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  businessInitials,
  getSiteDraftIdentity,
  marketFromLocation,
} from "@/lib/site-draft";
import SitePreviewPdfActions from "@/components/SitePreviewPdfActions";

export const metadata: Metadata = {
  title: "Website Preview",
  description: "A client-facing local business homepage preview.",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = {
  company?: string | string[];
  category?: string | string[];
  location?: string | string[];
  address?: string | string[];
  phone?: string | string[];
  website?: string | string[];
  maps?: string | string[];
  pitch?: string | string[];
  status?: string | string[];
  style?: string | string[];
  theme?: string | string[];
  sections?: string | string[];
  images?: string | string[];
  contentDepth?: string | string[];
  conversionGoal?: string | string[];
  layout?: string | string[];
  prompt?: string | string[];
  print?: string | string[];
};

type PreviewData = {
  company: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  maps: string;
  website: string;
  pitch: string;
  status: string;
};

type PreviewOptions = {
  style: "professional" | "premium" | "bold" | "friendly" | "minimal" | "creative";
  theme: "dark" | "light";
  sections: number;
  images: "abstract" | "gallery" | "before-after" | "none";
  contentDepth: "short" | "balanced" | "detailed";
  conversionGoal: "calls" | "quotes" | "bookings" | "visits";
  layout: "conversion" | "editorial" | "showcase";
};

function promptIncludes(prompt: string, terms: string[]) {
  const normalized = prompt.toLowerCase();
  return terms.some(term => normalized.includes(term));
}

function inferPreviewOptionsFromPrompt(prompt: string, current: PreviewOptions): PreviewOptions {
  if (!prompt) return current;
  const next = { ...current };

  if (promptIncludes(prompt, ["luxury", "premium", "high end", "high-end", "expensive", "elegant", "exclusive"])) {
    next.style = "premium";
    next.layout = "showcase";
    next.sections = Math.max(next.sections, 9);
    next.contentDepth = "detailed";
  }
  if (promptIncludes(prompt, ["bold", "loud", "energetic", "stand out", "punchy", "strong contrast"])) {
    next.style = "bold";
    next.layout = "conversion";
  }
  if (promptIncludes(prompt, ["creative", "funky", "playful", "colourful", "colorful", "different", "memorable"])) {
    next.style = "creative";
    next.images = "gallery";
  }
  if (promptIncludes(prompt, ["friendly", "family", "neighbourhood", "neighborhood", "warm", "local feel", "approachable"])) {
    next.style = "friendly";
  }
  if (promptIncludes(prompt, ["minimal", "simple", "clean", "fast", "no clutter", "straight to the point"])) {
    next.style = "minimal";
    next.sections = 5;
    next.contentDepth = "short";
    next.layout = "conversion";
  }
  if (promptIncludes(prompt, ["serious", "professional", "trust", "credible", "corporate", "established"])) {
    next.style = "professional";
  }

  if (promptIncludes(prompt, ["light", "white", "bright", "airy"])) next.theme = "light";
  if (promptIncludes(prompt, ["dark", "black", "midnight", "premium dark"])) next.theme = "dark";

  if (promptIncludes(prompt, ["before after", "before-and-after", "transformation", "case study", "proof"])) next.images = "before-after";
  if (promptIncludes(prompt, ["gallery", "photos", "photo", "images", "portfolio", "show work"])) next.images = "gallery";
  if (promptIncludes(prompt, ["no images", "text only", "text-first"])) next.images = "none";
  if (promptIncludes(prompt, ["brand visuals", "abstract", "graphic"])) next.images = "abstract";

  if (promptIncludes(prompt, ["call", "phone", "ring", "tap to call"])) next.conversionGoal = "calls";
  if (promptIncludes(prompt, ["quote", "estimate", "enquiry", "inquiry", "lead form"])) next.conversionGoal = "quotes";
  if (promptIncludes(prompt, ["book", "booking", "appointment", "schedule"])) next.conversionGoal = "bookings";
  if (promptIncludes(prompt, ["visit", "walk in", "directions", "store", "shop"])) next.conversionGoal = "visits";

  if (promptIncludes(prompt, ["story", "editorial", "brand story", "magazine"])) next.layout = "editorial";
  if (promptIncludes(prompt, ["showcase", "visual", "portfolio", "gallery-led"])) next.layout = "showcase";
  if (promptIncludes(prompt, ["conversion", "sales", "landing page", "lead gen", "cta"])) next.layout = "conversion";

  if (promptIncludes(prompt, ["full", "complete", "long", "detailed", "all sections"])) {
    next.sections = 11;
    next.contentDepth = "detailed";
  }
  if (promptIncludes(prompt, ["balanced", "not too long", "medium"])) {
    next.sections = 7;
    next.contentDepth = "balanced";
  }

  return next;
}

const GOAL_COPY: Record<PreviewOptions["conversionGoal"], { primary: string; secondary: string; section: string }> = {
  calls: {
    primary: "Call now",
    secondary: "Phone-first conversion",
    section: "Every important section keeps the phone path obvious for people ready to act now.",
  },
  quotes: {
    primary: "Request a quote",
    secondary: "Quote-ready enquiry flow",
    section: "The page frames the service clearly, then moves visitors into a confident quote request.",
  },
  bookings: {
    primary: "Book an appointment",
    secondary: "Booking-led experience",
    section: "The structure helps customers understand the offer and choose a time or next step.",
  },
  visits: {
    primary: "Get directions",
    secondary: "Local visit path",
    section: "Location, hours, map actions, and trust proof stay close to the surface.",
  },
};

const STYLE_MOOD: Record<PreviewOptions["style"], { rhythm: string; detail: string; shape: string }> = {
  professional: {
    rhythm: "Trust-first",
    detail: "Clear offer, proof, and service categories for serious buyers.",
    shape: "rounded-[1.5rem]",
  },
  premium: {
    rhythm: "High-value",
    detail: "More editorial space, stronger confidence cues, and a calmer buying path.",
    shape: "rounded-[2.25rem]",
  },
  bold: {
    rhythm: "Action-led",
    detail: "Sharper contrast, faster CTA rhythm, and stronger offer blocks.",
    shape: "rounded-[1.25rem]",
  },
  friendly: {
    rhythm: "Neighbourhood",
    detail: "Warm language, approachable proof, and a human local-service tone.",
    shape: "rounded-[2rem]",
  },
  minimal: {
    rhythm: "Clean and fast",
    detail: "Low-friction scanning with only the details needed to enquire.",
    shape: "rounded-2xl",
  },
  creative: {
    rhythm: "Memorable",
    detail: "More personality and visual motion while keeping the service path obvious.",
    shape: "rounded-[2.5rem]",
  },
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clean(value: string | string[] | undefined, fallback = "") {
  const next = (firstParam(value) ?? "").replace(/\s+/g, " ").trim();
  return (next || fallback).slice(0, 280);
}

function option<T extends string>(value: string | string[] | undefined, allowed: readonly T[], fallback: T): T {
  const next = clean(value) as T;
  return allowed.includes(next) ? next : fallback;
}

function sectionCount(value: string | string[] | undefined) {
  const next = Number.parseInt(clean(value), 10);
  if (!Number.isFinite(next)) return 7;
  return Math.max(5, Math.min(11, next));
}

function safeHttpUrl(value: string | string[] | undefined) {
  try {
    const url = new URL(clean(value));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function telHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

function panelClass(isLight: boolean) {
  return isLight
    ? "border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)]"
    : "border-white/10 bg-white/[0.045]";
}

function mutedClass(isLight: boolean) {
  return isLight ? "text-slate-600" : "text-white/64";
}

const SEGMENT_IMAGES: Record<string, string[]> = {
  auto: [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1632823471565-1ecdf5c298bb?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1000&q=80",
  ],
  cleaning: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=1000&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80",
  ],
  trade: [
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80",
  ],
  local: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
  ],
};

const FALLBACK_SEGMENT_IMAGES = SEGMENT_IMAGES.local ?? [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
];

function segmentImage(segment: string, index = 0) {
  const images = SEGMENT_IMAGES[segment] ?? FALLBACK_SEGMENT_IMAGES;
  return images[index % images.length]!;
}

function imageBackground(segment: string, index: number, overlay: string) {
  return `${overlay}, url("${segmentImage(segment, index)}")`;
}

function printStyles(isLight: boolean) {
  return `
    @page {
      size: A4;
      margin: 10mm;
    }

    @media print {
      html {
        background: ${isLight ? "#f8fafc" : "#070b12"} !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        background: ${isLight ? "#f8fafc" : "#070b12"} !important;
        margin: 0 !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .no-print {
        display: none !important;
      }

      .site-preview-root {
        display: block !important;
        min-height: auto !important;
        width: 100% !important;
        overflow: visible !important;
        padding-bottom: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .site-preview-root * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .site-preview-root section {
        position: relative !important;
        overflow: visible !important;
      }

      .site-preview-print-nav {
        display: flex !important;
      }

      .site-preview-root .mx-auto {
        margin-left: auto !important;
        margin-right: auto !important;
      }

      .site-preview-root .max-w-7xl {
        max-width: 1080px !important;
      }

      .site-preview-hero {
        display: block !important;
        min-height: auto !important;
        padding-top: 18px !important;
        padding-bottom: 22px !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
      }

      .site-preview-hero-grid {
        display: grid !important;
        flex: none !important;
        grid-template-columns: minmax(0, 1fr) !important;
        align-items: start !important;
        gap: 18px !important;
        padding-top: 28px !important;
        padding-bottom: 24px !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
      }

      .site-preview-hero-grid h1 {
        font-size: 46px !important;
        line-height: 1.04 !important;
        letter-spacing: 0 !important;
      }

      .site-preview-hero-grid p {
        font-size: 16px !important;
        line-height: 1.55 !important;
      }

      .site-preview-hero-visual {
        display: none !important;
      }

      .site-preview-signal-grid {
        margin-bottom: 0 !important;
      }

      .site-preview-root section > .mx-auto:not(.site-preview-hero) {
        padding-top: 30px !important;
        padding-bottom: 30px !important;
      }

      .site-preview-root h2 {
        font-size: 34px !important;
        line-height: 1.08 !important;
      }

      .site-preview-root h3 {
        line-height: 1.16 !important;
      }

      .site-preview-root [class*="shadow-"] {
        box-shadow: none !important;
      }

      .site-preview-root article,
      .site-preview-root blockquote,
      .site-preview-root .rounded-\\[2rem\\],
      .site-preview-root .rounded-3xl {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      a {
        text-decoration: none !important;
      }

      img,
      svg {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;
}

function HeadingBlock({
  eyebrow,
  title,
  copy,
  isLight,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  isLight: boolean;
}) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: "var(--site-accent)" }}>
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{title}</h2>
      <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{copy}</p>
    </div>
  );
}

function VisualStory({
  data,
  options,
  identity,
  initials,
  isLight,
}: {
  data: PreviewData;
  options: PreviewOptions;
  identity: ReturnType<typeof getSiteDraftIdentity>;
  initials: string;
  isLight: boolean;
}) {
  if (options.images === "none") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className={`rounded-[2rem] border p-7 sm:p-9 ${panelClass(isLight)}`}>
          <ImageIcon className="mb-4 h-8 w-8" style={{ color: identity.accent }} />
          <h2 className="text-3xl font-black">A clean page focused on the next call</h2>
          <p className={`mt-3 max-w-3xl text-lg leading-8 ${mutedClass(isLight)}`}>
            This version keeps attention on the services, trust proof, location, and contact path so customers can act quickly.
          </p>
        </div>
      </section>
    );
  }

  if (options.images === "before-after") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow="Before and after"
          title="Make the choice feel obvious before customers call"
          copy={`${data.company} should make services, proof, location, and the next step clear before a customer compares another business.`}
          isLight={isLight}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { label: "Harder to choose", items: ["Services are harder to compare", "Contact details can get missed", "Little proof appears before the call"] },
            { label: "Easier to call", items: ["Services are clear in seconds", "Phone and quote path stay visible", "Proof and local trust are structured"] },
          ].map((column, index) => (
            <article key={column.label} className={`rounded-[2rem] border p-6 ${panelClass(isLight)}`}>
              <p className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: index === 0 ? identity.accent2 : identity.accent }}>
                {column.label}
              </p>
              <div className="mt-5 space-y-3">
                {column.items.map(item => (
                  <div key={item} className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.04]"}`}>
                    <p className="font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (options.images === "gallery") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow="Service gallery"
          title="Show the work customers are already trying to understand"
          copy={`${data.company} can use service photos, repair examples, and proof blocks to help local customers feel safer before they call.`}
          isLight={isLight}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {identity.services.map((service, index) => (
            <article key={service.title} className={`min-h-[240px] overflow-hidden rounded-[2rem] border ${panelClass(isLight)}`}>
              <div
                className="h-36 bg-cover bg-center"
                style={{
                  backgroundImage: imageBackground(
                    identity.segment,
                    index + 1,
                    `linear-gradient(180deg, rgba(2,6,23,0.10), rgba(2,6,23,0.62))`,
                  ),
                }}
              />
              <div className="p-5">
                <p className="text-lg font-black">{service.title}</p>
                <p className={`mt-2 text-sm leading-6 ${mutedClass(isLight)}`}>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`grid gap-6 overflow-hidden rounded-[2rem] border p-5 sm:p-7 lg:grid-cols-[0.95fr_1.05fr] ${panelClass(isLight)}`}>
        <div className="p-2 sm:p-4">
          <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: identity.accent }}>
            Customer view
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{identity.visualTitle}</h2>
          <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{identity.visualSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {identity.trustBadges.map(badge => (
              <span key={badge} className={`rounded-full border px-3 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-white/[0.05] text-white/70"}`}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] p-5">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `radial-gradient(circle at 22% 20%, ${identity.accentSoft}, transparent 34%), radial-gradient(circle at 88% 8%, ${identity.accent2}44, transparent 28%)`,
            }}
          />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div
                className="grid h-16 w-16 place-items-center rounded-3xl text-xl font-black text-slate-950"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {initials}
              </div>
              <Star className="h-8 w-8 fill-current" style={{ color: identity.accent2 }} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">{data.category}</p>
              <h3 className="mt-3 max-w-sm text-4xl font-black leading-tight text-white">{data.company}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SitePreviewPage({ searchParams }: { searchParams?: SearchParams }) {
  const company = clean(searchParams?.company, "Local Business");
  const category = clean(searchParams?.category, "Local service");
  const location = clean(searchParams?.location, "Your area");
  const address = clean(searchParams?.address);
  const phone = clean(searchParams?.phone);
  const maps = safeHttpUrl(searchParams?.maps);
  const website = safeHttpUrl(searchParams?.website);
  const pitch = clean(searchParams?.pitch);
  const designPrompt = clean(searchParams?.prompt);
  const data: PreviewData = {
    company,
    category,
    location,
    address,
    phone,
    maps,
    website,
    pitch,
    status: clean(searchParams?.status, "unknown"),
  };

  const baseOptions: PreviewOptions = {
    style: option(searchParams?.style, ["professional", "premium", "bold", "friendly", "minimal", "creative"] as const, "professional"),
    theme: option(searchParams?.theme, ["dark", "light"] as const, "dark"),
    sections: sectionCount(searchParams?.sections),
    images: option(searchParams?.images, ["abstract", "gallery", "before-after", "none"] as const, "gallery"),
    contentDepth: option(searchParams?.contentDepth, ["short", "balanced", "detailed"] as const, "balanced"),
    conversionGoal: option(searchParams?.conversionGoal, ["calls", "quotes", "bookings", "visits"] as const, "quotes"),
    layout: option(searchParams?.layout, ["conversion", "editorial", "showcase"] as const, "conversion"),
  };
  const options = inferPreviewOptionsFromPrompt(designPrompt, baseOptions);

  const identity = getSiteDraftIdentity(data);
  const initials = businessInitials(company);
  const market = marketFromLocation(location);
  const callLink = telHref(phone);
  const heroPitch = identity.subheadline;
  const isLight = options.theme === "light";
  const styleMood = STYLE_MOOD[options.style];
  const goalCopy = GOAL_COPY[options.conversionGoal];
  const autoPrint = clean(searchParams?.print).toLowerCase() === "1";
  const heroGrid = options.layout === "editorial"
    ? "lg:grid-cols-[0.88fr_1.12fr]"
    : options.layout === "showcase"
      ? "lg:grid-cols-[0.95fr_1.05fr]"
      : "lg:grid-cols-[1.04fr_0.96fr]";
  const serviceLimit = options.contentDepth === "short" ? 3 : identity.services.length;
  const processLimit = options.contentDepth === "detailed" ? identity.process.length : Math.min(3, identity.process.length);
  const middleBudget = Math.max(3, options.sections - 2);

  const themeVars = {
    "--site-accent": identity.accent,
    "--site-accent-2": identity.accent2,
    "--site-accent-soft": identity.accentSoft,
  } as CSSProperties;

  const middleSections: ReactNode[] = [
    <section key="services" id="services" className={isLight ? "border-y border-slate-200 bg-white" : "border-y border-white/10 bg-white/[0.035]"}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow="Services made clear"
          title="What customers should understand in seconds"
          copy={`${company} should make the right service, phone number, location, and reason to trust the business obvious before customers keep searching.`}
          isLight={isLight}
        />
        <div className="grid gap-4 lg:grid-cols-4">
          {identity.services.slice(0, serviceLimit).map(service => (
            <article key={service.title} className={`min-h-[230px] rounded-3xl border p-5 ${panelClass(isLight)}`}>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: identity.accentSoft }}>
                <Award className="h-6 w-6" style={{ color: identity.accent }} />
              </div>
              <h3 className="text-xl font-black">{service.title}</h3>
              <p className={`mt-3 leading-7 ${mutedClass(isLight)}`}>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>,

    <VisualStory
      key="visual"
      data={data}
      options={options}
      identity={identity}
      initials={initials}
      isLight={isLight}
    />,

    <section key="trust" className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <MessageCircle className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <p className={`text-sm font-black uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-white/45"}`}>
          Customer confidence
        </p>
        <blockquote className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
          "{identity.testimonial.quote}"
        </blockquote>
        <p className={`mt-5 font-bold ${mutedClass(isLight)}`}>{identity.testimonial.name}</p>
      </div>
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: identity.accent }}>
          {identity.visualTitle}
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">Confidence before the first call</h2>
        <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{identity.visualSubtitle}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {[...identity.trustBadges, goalCopy.secondary].map(badge => (
            <span key={badge} className={`rounded-full border px-3 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-white/[0.05] text-white/70"}`}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>,

    <section key="process" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <HeadingBlock
        eyebrow="Simple conversion path"
        title="How customers move from search to call"
        copy={`A cleaner path helps ${company} turn local attention into action without making customers hunt for the next step.`}
        isLight={isLight}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {identity.process.slice(0, processLimit).map(item => (
          <div key={item.step} className={`min-h-[220px] rounded-3xl border p-5 ${panelClass(isLight)}`}>
            <p className="text-sm font-black" style={{ color: identity.accent }}>{item.step}</p>
            <h3 className="mt-3 text-xl font-black">{item.title}</h3>
            <p className={`mt-3 text-sm leading-6 ${mutedClass(isLight)}`}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>,

    <section key="pages" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <Layers className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <p className={`text-sm font-black uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-white/45"}`}>
          Service shortcuts
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">Find the right service faster</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {identity.pages.map(page => (
            <span key={page} className="rounded-full px-4 py-2 text-sm font-black text-slate-950" style={{ background: identity.accent }}>
              {page}
            </span>
          ))}
        </div>
      </div>
    </section>,

    <section key="local" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`grid gap-4 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-3 ${panelClass(isLight)}`}>
        {identity.proof.map(item => (
          <div key={`${item.value}-${item.label}`} className={`rounded-3xl border p-5 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.055]"}`}>
            <p className="text-3xl font-black" style={{ color: identity.accent }}>{item.value}</p>
            <p className={`mt-2 text-sm leading-5 ${mutedClass(isLight)}`}>{item.label}</p>
          </div>
        ))}
      </div>
    </section>,

    <section key="details" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <ShieldCheck className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <h2 className="text-3xl font-black sm:text-5xl">Local details stay close to the sale</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[address || market, phone || "Phone CTA ready", website ? "Existing website reviewed" : "Website gap visible"].map(item => (
            <div key={item} className={`rounded-2xl border p-4 font-bold ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.04]"}`}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>,

    <section key="expanded-copy" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
      <div className={`rounded-[2rem] border p-6 sm:p-8 ${panelClass(isLight)}`}>
        <MousePointerClick className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
        <h2 className="text-3xl font-black sm:text-5xl">Why customers should choose {company}</h2>
        <p className={`mt-4 max-w-4xl text-lg leading-8 ${mutedClass(isLight)}`}>
          Customers comparing {data.category.toLowerCase()} options in {market} need quick proof, plain service descriptions, a visible phone path, and enough local confidence to stop searching and call.
        </p>
      </div>
    </section>,
  ];

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: printStyles(isLight) }} />
    <SitePreviewPdfActions autoPrint={autoPrint} pdfTitle={`${company} homepage`} />
    <main className={`site-preview-root min-h-screen pb-20 sm:pb-0 ${isLight ? "bg-[#f8fafc] text-slate-950" : "bg-[#070b12] text-white"}`} style={themeVars}>
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 ${isLight ? "bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]"} bg-[size:54px_54px]`} />
        <div
          className="absolute inset-x-0 top-0 h-[560px] opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${identity.accentSoft}, transparent 34%), radial-gradient(circle at 78% 4%, ${identity.accent2}33, transparent 30%)`,
          }}
        />
        <div className="absolute bottom-0 left-1/2 h-80 w-[80vw] -translate-x-1/2 rounded-full blur-3xl" style={{ background: identity.accentSoft }} />

        <div className="site-preview-hero relative mx-auto flex max-w-7xl flex-col px-5 py-6 sm:px-8 lg:min-h-[690px] lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl font-black text-slate-950 shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {initials}
              </div>
              <div>
                <p className="text-lg font-black leading-none">{company}</p>
                <p className={`mt-1 text-xs font-bold uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-white/45"}`}>
                  {category}
                </p>
              </div>
            </div>
            <nav className={`site-preview-print-nav hidden items-center gap-1 rounded-full border p-1 md:flex ${isLight ? "border-slate-950 bg-slate-950 shadow-lg" : "border-white/10 bg-white/5"}`}>
              {identity.pages.slice(0, 3).map(page => (
                <a
                  key={page}
                  href="#services"
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${isLight ? "text-white hover:bg-white/10" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                >
                  {page}
                </a>
              ))}
            </nav>
            <div className={`hidden items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold sm:flex ${isLight ? "border-slate-950 bg-white text-slate-700" : "border-white/10 bg-white/5 text-white/70"}`}>
              {phone ? <Phone className="h-4 w-4" style={{ color: identity.accent }} /> : <MapPin className="h-4 w-4" style={{ color: identity.accent }} />}
              {phone || market}
            </div>
          </header>

          <div className={`site-preview-hero-grid grid flex-1 items-center gap-8 py-8 sm:py-10 lg:gap-12 lg:py-12 ${heroGrid}`}>
            <div>
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.07] text-white/75"}`}>
                <MapPin className="h-4 w-4" style={{ color: identity.accent }} />
                Serving {market}
              </div>
              <h1 className="max-w-4xl break-words text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                {identity.headline}
              </h1>
              <p className={`mt-6 max-w-2xl text-xl leading-9 ${mutedClass(isLight)}`}>{heroPitch}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {(callLink || options.conversionGoal !== "calls") && (
                  <a
                    href={options.conversionGoal === "visits" && maps ? maps : callLink || "#services"}
                    target={options.conversionGoal === "visits" && maps ? "_blank" : undefined}
                    rel={options.conversionGoal === "visits" && maps ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-black text-slate-950 transition hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                  >
                    {options.conversionGoal === "visits" ? <MapPin className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                    {goalCopy.primary}
                  </a>
                )}
                {maps && options.conversionGoal !== "visits" && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-lg font-bold transition ${isLight ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
                  >
                    <MapPin className="h-5 w-5" />
                    {identity.secondaryCta}
                  </a>
                )}
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {identity.proof.map(item => (
                  <div key={`${item.value}-${item.label}`} className={`rounded-3xl border p-4 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.055]"}`}>
                    <p className="text-2xl font-black" style={{ color: identity.accent }}>{item.value}</p>
                    <p className={`mt-1 text-sm leading-5 ${mutedClass(isLight)}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="site-preview-hero-visual relative block">
              <div
                className="absolute -inset-5 rounded-[2.5rem] opacity-60 blur-2xl"
                style={{ background: `linear-gradient(135deg, ${identity.accentSoft}, ${identity.accent2}22)` }}
              />
              <div className={`relative overflow-hidden rounded-[2rem] border shadow-2xl ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-[#0b1220]"}`}>
                <div
                  className="relative min-h-[330px] bg-cover bg-center p-4 sm:min-h-[430px] sm:p-5"
                  style={{
                    backgroundImage: imageBackground(
                      identity.segment,
                      0,
                      "linear-gradient(180deg, rgba(2,6,23,0.10), rgba(2,6,23,0.86))",
                    ),
                  }}
                >
                  <div className="flex h-full min-h-[300px] flex-col justify-between sm:min-h-[390px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-950">
                        {identity.trustBadges[0] ?? "Trusted local service"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/65 px-3 py-2 text-sm font-black text-white backdrop-blur">
                        <Star className="h-4 w-4 fill-current" style={{ color: identity.accent2 }} />
                        Local choice
                      </span>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/72 p-4 text-white backdrop-blur-md sm:p-5">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">{identity.visualTitle}</p>
                      <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{company}</h2>
                      <p className="mt-3 text-base leading-7 text-white/76">{identity.visualSubtitle}</p>
                    </div>
                  </div>
                </div>
                <div className={`grid gap-3 p-4 ${isLight ? "bg-white" : "bg-[#0b1220]"}`}>
                  {identity.services.slice(0, 3).map(service => (
                    <div key={service.title} className={`flex items-start gap-3 rounded-2xl border p-3 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.04]"}`}>
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: identity.accent }} />
                      <div>
                        <h3 className="font-black">{service.title}</h3>
                        <p className={`mt-1 text-sm leading-6 ${mutedClass(isLight)}`}>{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`site-preview-signal-grid mb-8 grid gap-3 rounded-[2rem] border p-3 sm:grid-cols-3 ${isLight ? "border-slate-200 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]" : "border-white/10 bg-white/[0.055]"}`}>
            {[
              { label: phone ? "Call direct" : "Quick enquiry", value: phone || goalCopy.primary, icon: Phone },
              { label: "Local area", value: address || market, icon: MapPin },
              { label: "Popular service", value: identity.pages[0] ?? category, icon: CheckCircle },
            ].map(item => (
              <div key={item.label} className={`${styleMood.shape} border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-black/15"}`}>
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" style={{ color: identity.accent }} />
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-white/42"}`}>{item.label}</p>
                </div>
                <p className="mt-2 text-base font-black leading-6">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {middleSections.slice(0, middleBudget)}

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div
          className={`overflow-hidden rounded-[2rem] border p-8 text-center sm:p-12 ${isLight ? "border-slate-200 bg-white" : "border-white/10"}`}
          style={{ background: isLight ? "white" : `linear-gradient(135deg, ${identity.accentSoft}, rgba(255,255,255,0.045))` }}
        >
          <Clock className="mx-auto mb-5 h-8 w-8" style={{ color: identity.accent }} />
          <h2 className="text-3xl font-black sm:text-5xl">Need {data.category.toLowerCase()} in {market}?</h2>
          <p className={`mx-auto mt-4 max-w-2xl text-lg leading-8 ${mutedClass(isLight)}`}>
            {company} is easy to reach, easy to understand, and ready for customers who want a clear next step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {(callLink || options.conversionGoal !== "calls") && (
              <a
                href={options.conversionGoal === "visits" && maps ? maps : callLink || "#services"}
                target={options.conversionGoal === "visits" && maps ? "_blank" : undefined}
                rel={options.conversionGoal === "visits" && maps ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black text-slate-950"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {goalCopy.primary}
                <ArrowRight className="h-5 w-5" />
              </a>
            )}
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 font-bold ${isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/15 text-white"}`}>
                <MapPin className="h-5 w-5" />
                View location
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
