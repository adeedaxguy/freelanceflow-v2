"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  LayoutTemplate,
  MapPin,
  Moon,
  Palette,
  Phone,
  Sparkles,
  Sun,
  Wand2,
} from "lucide-react";
import {
  businessInitials,
  getSiteDraftIdentity,
} from "@/lib/site-draft";

type DraftData = {
  company: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  website: string;
  maps: string;
  pitch: string;
  status: string;
};

type DesignOptions = {
  style: string;
  theme: string;
  sections: string;
  images: string;
  contentDepth: string;
  conversionGoal: string;
  layout: string;
};

type Option = {
  value: string;
  label: string;
  description: string;
};

const STYLE_OPTIONS: Option[] = [
  { value: "professional", label: "Professional", description: "Polished, serious, trust-first service site." },
  { value: "premium", label: "Premium", description: "High-end positioning with stronger proof and spacing." },
  { value: "bold", label: "Bold", description: "Sharper contrast, punchy cards, energetic CTA rhythm." },
  { value: "friendly", label: "Friendly", description: "Warm local feel for family-run and neighbourhood businesses." },
  { value: "minimal", label: "Minimal", description: "Clean, fast, direct, with less visual noise." },
  { value: "creative", label: "Creative", description: "More expressive visuals without feeling gimmicky." },
];

const THEME_OPTIONS: Option[] = [
  { value: "dark", label: "Dark", description: "Modern contrast, premium feel, strong visual pop." },
  { value: "light", label: "Light", description: "Bright local-service look with clean trust cues." },
];

const SECTION_OPTIONS: Option[] = [
  { value: "5", label: "5 sections", description: "Quick landing page for fast client pitching." },
  { value: "7", label: "7 sections", description: "Balanced homepage with services, proof, and CTA." },
  { value: "9", label: "9 sections", description: "Full concept with visual proof and page ideas." },
  { value: "11", label: "11 sections", description: "Richer mockup for higher-ticket website deals." },
];

const IMAGE_OPTIONS: Option[] = [
  { value: "abstract", label: "Smart visuals", description: "Free CSS-generated branded visuals, no stock dependency." },
  { value: "gallery", label: "Gallery blocks", description: "Service-specific image placeholders for work samples." },
  { value: "before-after", label: "Before / after", description: "Comparison section for transformation-based selling." },
  { value: "none", label: "No images", description: "Text-first page when a clean proposal is better." },
];

const CONTENT_OPTIONS: Option[] = [
  { value: "short", label: "Short", description: "Tight copy for quick review." },
  { value: "balanced", label: "Balanced", description: "Enough detail to sell without dragging." },
  { value: "detailed", label: "Detailed", description: "More context, proof, and service explanation." },
];

const GOAL_OPTIONS: Option[] = [
  { value: "calls", label: "Phone calls", description: "Push tap-to-call and urgent enquiries." },
  { value: "quotes", label: "Quote requests", description: "Best for websites, repairs, cleaning, trades." },
  { value: "bookings", label: "Bookings", description: "Good for appointments, salons, cleaners, restaurants." },
  { value: "visits", label: "Store visits", description: "Emphasise directions, hours, and local intent." },
];

const LAYOUT_OPTIONS: Option[] = [
  { value: "conversion", label: "Conversion split", description: "Hero plus offer, proof, service cards, and CTA." },
  { value: "editorial", label: "Editorial", description: "More story-led, premium local brand feel." },
  { value: "showcase", label: "Showcase", description: "Visual-heavy layout for selling the finished outcome." },
];

function clean(value: string | null, fallback = "") {
  const next = (value ?? "").replace(/\s+/g, " ").trim();
  return (next || fallback).slice(0, 240);
}

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function optionValue(value: string | null, options: Option[], fallback: string) {
  const cleanValue = clean(value);
  return options.some(option => option.value === cleanValue) ? cleanValue : fallback;
}

function buildPreviewSearch(data: DraftData, options: DesignOptions) {
  const params = new URLSearchParams({
    company: data.company,
    category: data.category,
    location: data.location,
    address: data.address,
    phone: data.phone,
    pitch: data.pitch,
    status: data.status,
    style: options.style,
    theme: options.theme,
    sections: options.sections,
    images: options.images,
    contentDepth: options.contentDepth,
    conversionGoal: options.conversionGoal,
    layout: options.layout,
  });

  if (data.website) params.set("website", data.website);
  if (data.maps) params.set("maps", data.maps);
  return params.toString();
}

function OptionGrid({
  title,
  description,
  icon: Icon,
  options,
  value,
  onChange,
  columns = "sm:grid-cols-2",
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary-light">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className={`grid gap-3 ${columns}`}>
        {options.map(option => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-[112px] rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-primary/60 bg-primary/15 shadow-glow"
                  : "border-border bg-background/55 hover:border-primary/35 hover:bg-primary/8"
              }`}
            >
              <span className={`text-base font-black ${active ? "text-primary-light" : "text-foreground"}`}>
                {option.label}
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WebDesignBuilderContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const data = useMemo<DraftData>(() => ({
    company: clean(searchParams.get("company"), "Local Business"),
    category: clean(searchParams.get("category"), "Local service"),
    location: clean(searchParams.get("location"), "Local market"),
    address: clean(searchParams.get("address")),
    phone: clean(searchParams.get("phone")),
    website: safeHttpUrl(clean(searchParams.get("website"))),
    maps: safeHttpUrl(clean(searchParams.get("maps"))),
    pitch: clean(searchParams.get("pitch"), "A cleaner, faster website can turn local searches into calls, quote requests, and booked work."),
    status: clean(searchParams.get("status"), "unknown"),
  }), [searchParams]);

  const [style, setStyle] = useState(() => optionValue(searchParams.get("style"), STYLE_OPTIONS, "professional"));
  const [theme, setTheme] = useState(() => optionValue(searchParams.get("theme"), THEME_OPTIONS, "dark"));
  const [sections, setSections] = useState(() => optionValue(searchParams.get("sections"), SECTION_OPTIONS, "7"));
  const [images, setImages] = useState(() => optionValue(searchParams.get("images"), IMAGE_OPTIONS, "abstract"));
  const [contentDepth, setContentDepth] = useState(() => optionValue(searchParams.get("contentDepth"), CONTENT_OPTIONS, "balanced"));
  const [conversionGoal, setConversionGoal] = useState(() => optionValue(searchParams.get("conversionGoal"), GOAL_OPTIONS, "quotes"));
  const [layout, setLayout] = useState(() => optionValue(searchParams.get("layout"), LAYOUT_OPTIONS, "conversion"));

  const options = useMemo<DesignOptions>(() => ({
    style,
    theme,
    sections,
    images,
    contentDepth,
    conversionGoal,
    layout,
  }), [contentDepth, conversionGoal, images, layout, sections, style, theme]);

  const previewHref = `/site-preview?${buildPreviewSearch(data, options)}`;
  const identity = useMemo(() => getSiteDraftIdentity(data), [data]);
  const initials = businessInitials(data.company);

  const proposalHref = `/dashboard/proposal/new?${new URLSearchParams({
    company: data.company,
    title: `Website for ${data.company}`,
    description: data.pitch,
    niche: "web-development",
    leadType: "local-business",
    url: data.maps || data.website,
  }).toString()}`;

  async function copyPreviewLink() {
    const absoluteUrl = `${window.location.origin}${previewHref}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard/local-leads"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Local leads
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Web design studio</p>
              <h1 className="mt-1 text-3xl font-black text-foreground sm:text-4xl">Create a client-ready website concept</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/15"
            >
              <ExternalLink className="h-4 w-4" />
              Open beta preview
            </a>
            <button
              type="button"
              onClick={copyPreviewLink}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy beta link"}
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-card shadow-card">
          <div className="grid gap-0 lg:grid-cols-[1fr_390px]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div
                  className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-3xl text-2xl font-black text-slate-950 shadow-glow"
                  style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                >
                  {initials}
                </div>
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                      {identity.logoLabel} concept
                    </span>
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-light">
                      {sections} sections
                    </span>
                  </div>
                  <h2 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
                    {data.company}
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    {identity.pitchHook}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business type</p>
                  <p className="mt-1 font-bold text-foreground">{data.category}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Market</p>
                  <p className="mt-1 font-bold text-foreground">{data.location}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Goal</p>
                  <p className="mt-1 font-bold text-foreground">
                    {GOAL_OPTIONS.find(option => option.value === conversionGoal)?.label}
                  </p>
                </div>
              </div>
            </div>

            <aside className="border-t border-border bg-background/50 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <h2 className="text-xl font-black text-foreground">Client-facing result</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Each choice rewrites the preview link, so you can show multiple directions before pitching the final build.
              </p>
              <div className="mt-5 space-y-3">
                {identity.services.slice(0, 3).map(service => (
                  <div key={service.title} className="flex items-center gap-3 rounded-2xl border border-border bg-surface/70 p-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="font-semibold text-foreground">{service.title}</span>
                  </div>
                ))}
              </div>
              <Link
                href={proposalHref}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-3 font-black text-white transition hover:opacity-90"
              >
                <Sparkles className="h-5 w-5" />
                Write proposal for this site
              </Link>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <OptionGrid
              title="Choose the visual direction"
              description="Pick the first impression you want the prospect to feel when they open the beta link."
              icon={Palette}
              options={STYLE_OPTIONS}
              value={style}
              onChange={setStyle}
              columns="sm:grid-cols-2 xl:grid-cols-3"
            />

            <OptionGrid
              title="Control the page structure"
              description="Use fewer sections for quick outreach, or a fuller version when the lead looks high value."
              icon={LayoutTemplate}
              options={SECTION_OPTIONS}
              value={sections}
              onChange={setSections}
              columns="sm:grid-cols-2 xl:grid-cols-4"
            />

            <OptionGrid
              title="Set image treatment"
              description="The preview uses generated design blocks and smart placeholders, so it works without paid stock assets."
              icon={ImageIcon}
              options={IMAGE_OPTIONS}
              value={images}
              onChange={setImages}
              columns="sm:grid-cols-2 xl:grid-cols-4"
            />
          </div>

          <div className="space-y-6">
            <OptionGrid
              title="Theme"
              description="Create either a premium dark concept or a clean light local-business site."
              icon={theme === "dark" ? Moon : Sun}
              options={THEME_OPTIONS}
              value={theme}
              onChange={setTheme}
            />

            <OptionGrid
              title="Copy depth"
              description="Tune the content length before sharing with the prospect."
              icon={Wand2}
              options={CONTENT_OPTIONS}
              value={contentDepth}
              onChange={setContentDepth}
            />

            <OptionGrid
              title="Primary conversion goal"
              description="Change the CTA language and supporting sections around the action you want."
              icon={Phone}
              options={GOAL_OPTIONS}
              value={conversionGoal}
              onChange={setConversionGoal}
            />

            <OptionGrid
              title="Layout style"
              description="Choose how the page sells: direct conversion, brand story, or visual showcase."
              icon={MapPin}
              options={LAYOUT_OPTIONS}
              value={layout}
              onChange={setLayout}
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Live link</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">Final preview generated from your selections</h2>
            </div>
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Full page <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-[#071014]">
            <div className="border-b border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 truncate text-xs text-white/50">{previewHref}</span>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {STYLE_OPTIONS.find(option => option.value === style)?.label} {theme} concept
                  </p>
                  <h3 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
                    {identity.headline}
                  </h3>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
                    {identity.subheadline}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {data.phone && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950">
                        <Phone className="h-4 w-4" />
                        {GOAL_OPTIONS.find(option => option.value === conversionGoal)?.label}
                      </span>
                    )}
                    {data.maps && (
                      <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-bold text-white">
                        <MapPin className="h-4 w-4" />
                        Map-ready
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid h-40 w-full max-w-sm place-items-center rounded-[2rem] border border-white/10 bg-white/[0.06]">
                  <div
                    className="grid h-24 w-24 place-items-center rounded-3xl text-3xl font-black text-slate-950"
                    style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                  >
                    {initials}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function WebDesignPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-6 text-foreground">Loading web design studio...</div>}>
      <WebDesignBuilderContent />
    </Suspense>
  );
}
