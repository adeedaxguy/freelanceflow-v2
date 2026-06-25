import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  ShieldCheck,
  Sparkles,
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
  description: "A private website concept preview.",
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

const STYLE_COPY: Record<PreviewOptions["style"], { label: string; tone: string }> = {
  professional: {
    label: "Trusted local service website",
    tone: "Clear services, visible proof, and a practical path from search to enquiry.",
  },
  premium: {
    label: "Premium brand-forward website",
    tone: "More whitespace, stronger trust cues, and a higher-value buying experience.",
  },
  bold: {
    label: "Bold conversion website",
    tone: "Sharper sections, punchier CTAs, and a page built to make action feel obvious.",
  },
  friendly: {
    label: "Friendly neighbourhood website",
    tone: "Warm local language, approachable proof, and a simple contact path.",
  },
  minimal: {
    label: "Clean direct-response website",
    tone: "Less clutter, faster scanning, and only the information customers need.",
  },
  creative: {
    label: "Creative standout website",
    tone: "More personality and movement while keeping the offer easy to understand.",
  },
};

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
          <h2 className="text-3xl font-black">A clean page without stock-image distractions</h2>
          <p className={`mt-3 max-w-3xl text-lg leading-8 ${mutedClass(isLight)}`}>
            This version keeps attention on the offer, trust proof, location, and action path instead of using generic imagery.
          </p>
        </div>
      </section>
    );
  }

  if (options.images === "before-after") {
    return (
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <HeadingBlock
          eyebrow="Before and after concept"
          title="Show the upgrade before asking for the sale"
          copy={`The mockup gives ${data.company} a simple way to see how a clearer site can improve trust and action.`}
          isLight={isLight}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { label: "Current impression", items: ["Harder to compare services", "Contact details can get missed", "Little proof before the call"] },
            { label: "Proposed experience", items: ["Services are clear in seconds", "Phone and quote path stay visible", "Proof and local trust are structured"] },
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
          eyebrow="Visual selling blocks"
          title="A gallery that feels specific to the work"
          copy="Instead of stock photos, this concept uses branded visual slots that can later be replaced with real work samples."
          isLight={isLight}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {identity.services.map((service, index) => (
            <article key={service.title} className={`min-h-[240px] overflow-hidden rounded-[2rem] border ${panelClass(isLight)}`}>
              <div
                className="h-32"
                style={{
                  background: `radial-gradient(circle at ${25 + index * 12}% 25%, ${identity.accent}, transparent 28%), linear-gradient(135deg, ${identity.accentSoft}, ${identity.accent2}33)`,
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
            Brand preview
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

  const options: PreviewOptions = {
    style: option(searchParams?.style, ["professional", "premium", "bold", "friendly", "minimal", "creative"] as const, "professional"),
    theme: option(searchParams?.theme, ["dark", "light"] as const, "dark"),
    sections: sectionCount(searchParams?.sections),
    images: option(searchParams?.images, ["abstract", "gallery", "before-after", "none"] as const, "abstract"),
    contentDepth: option(searchParams?.contentDepth, ["short", "balanced", "detailed"] as const, "balanced"),
    conversionGoal: option(searchParams?.conversionGoal, ["calls", "quotes", "bookings", "visits"] as const, "quotes"),
    layout: option(searchParams?.layout, ["conversion", "editorial", "showcase"] as const, "conversion"),
  };

  const identity = getSiteDraftIdentity(data);
  const initials = businessInitials(company);
  const market = marketFromLocation(location);
  const callLink = telHref(phone);
  const heroPitch = pitch || identity.subheadline;
  const isLight = options.theme === "light";
  const styleCopy = STYLE_COPY[options.style];
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
          eyebrow="Website built around real buying intent"
          title="What the new site should make obvious"
          copy={goalCopy.section}
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
          {styleCopy.label}
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">The pitch feels easier to believe</h2>
        <p className={`mt-4 text-lg leading-8 ${mutedClass(isLight)}`}>{styleCopy.tone}</p>
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
        title="How visitors become enquiries"
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
          Suggested site map
        </p>
        <h2 className="mt-3 text-3xl font-black sm:text-5xl">Pages worth building first</h2>
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
        <h2 className="text-3xl font-black sm:text-5xl">Why this would be easier to sell</h2>
        <p className={`mt-4 max-w-4xl text-lg leading-8 ${mutedClass(isLight)}`}>
          The concept is specific to {data.category.toLowerCase()} buyers in {market}. It gives the prospect a concrete beta link, a clearer service path, and a practical reason to discuss the website instead of hearing a generic pitch.
        </p>
      </div>
    </section>,
  ];

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: printStyles(isLight) }} />
    <SitePreviewPdfActions autoPrint={autoPrint} pdfTitle={`${company} homepage website concept`} />
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

        <div className="site-preview-hero relative mx-auto flex max-w-7xl flex-col px-5 py-6 sm:px-8 lg:min-h-[760px] lg:px-10">
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
                  {STYLE_COPY[options.style].label}
                </p>
              </div>
            </div>
            <nav className={`site-preview-print-nav hidden items-center gap-1 rounded-full border p-1 md:flex ${isLight ? "border-slate-200 bg-white/75" : "border-white/10 bg-white/5"}`}>
              {identity.pages.slice(0, 3).map(page => (
                <a
                  key={page}
                  href="#services"
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950" : "text-white/62 hover:bg-white/10 hover:text-white"}`}
                >
                  {page}
                </a>
              ))}
            </nav>
            <div className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold sm:flex ${isLight ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-white/70"}`}>
              <ShieldCheck className="h-4 w-4" style={{ color: identity.accent }} />
              Private preview
            </div>
          </header>

          <div className={`site-preview-hero-grid grid flex-1 items-center gap-10 py-10 lg:gap-12 lg:py-14 ${heroGrid}`}>
            <div>
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${isLight ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.07] text-white/75"}`}>
                <Sparkles className="h-4 w-4" style={{ color: identity.accent }} />
                {styleMood.rhythm} concept for {identity.eyebrow}
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

            <div className="site-preview-hero-visual relative hidden sm:block">
              <div
                className="absolute -inset-5 rounded-[2.5rem] opacity-60 blur-2xl"
                style={{ background: `linear-gradient(135deg, ${identity.accentSoft}, ${identity.accent2}22)` }}
              />
              <div className={`relative rounded-[2rem] border p-4 shadow-2xl backdrop-blur ${isLight ? "border-slate-200 bg-white/85" : "border-white/10 bg-white/[0.07]"}`}>
                <div className={`overflow-hidden rounded-[1.5rem] border ${isLight ? "border-slate-200 bg-slate-950 text-white" : "border-white/10 bg-[#0b1220]"}`}>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5" style={{ background: identity.surface }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-black text-slate-950"
                        style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">{identity.visualTitle}</p>
                        <h2 className="mt-1 text-2xl font-black">{company}</h2>
                      </div>
                    </div>
                    <Star className="h-7 w-7 fill-current" style={{ color: identity.accent2 }} />
                  </div>

                  <div className="p-5">
                    <p className="text-lg leading-8 text-white/70">{identity.visualSubtitle}</p>
                    <div className="mt-5 hidden gap-3 sm:grid">
                      {identity.services.slice(0, options.contentDepth === "short" ? 2 : 3).map(service => (
                        <div key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" style={{ color: identity.accent }} />
                            <h3 className="font-black">{service.title}</h3>
                          </div>
                          <p className="text-sm leading-6 text-white/62">{service.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.82fr]">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Contact</p>
                        <div className="mt-3 space-y-2 text-white/72">
                          {address && <p>{address}</p>}
                          {phone && <p>{phone}</p>}
                          {website && (
                            <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline" style={{ color: identity.accent }}>
                              Current website <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Design logic</p>
                        <p className="mt-3 text-sm leading-6 text-white/70">{styleMood.detail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`site-preview-signal-grid mb-10 grid gap-3 rounded-[2rem] border p-3 sm:grid-cols-3 ${isLight ? "border-slate-200 bg-white/80" : "border-white/10 bg-white/[0.055]"}`}>
            {[
              { label: "Lead signal", value: data.status === "has-website" ? "Modernise current site" : "Website gap visible" },
              { label: "Offer angle", value: identity.pitchHook },
              { label: "Primary action", value: goalCopy.primary },
            ].map(item => (
              <div key={item.label} className={`${styleMood.shape} border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-black/15"}`}>
                <p className={`text-xs font-black uppercase tracking-[0.18em] ${isLight ? "text-slate-500" : "text-white/42"}`}>{item.label}</p>
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
          <h2 className="text-3xl font-black sm:text-5xl">Ready to win more work in {market}?</h2>
          <p className={`mx-auto mt-4 max-w-2xl text-lg leading-8 ${mutedClass(isLight)}`}>
            The page is built to make {company} easier to trust, easier to understand, and easier to contact from a phone.
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
