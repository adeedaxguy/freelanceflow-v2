"use client";

import type { ElementType } from "react";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  MapPin,
  Moon,
  Palette,
  Phone,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Shuffle,
  Sun,
  Wand2,
} from "lucide-react";
import {
  businessInitials,
  getSiteDraftIdentity,
} from "@/lib/site-draft";
import {
  DESIGN_VARIATIONS,
  nextDesignVariationId,
  resolveDesignVariation,
  variationToOptionPatch,
} from "@/lib/site-design";
import { copyText } from "@/lib/clipboard";

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
  prompt: string;
  variation: string;
  headline: string;
  subheadline: string;
  cta: string;
  accent: string;
};

type Option = {
  value: string;
  label: string;
  description: string;
};

type BuilderStep = {
  key: "brief" | "direction" | "launch";
  label: string;
  title: string;
  description: string;
  icon: ElementType;
};

const BUILDER_STEPS: BuilderStep[] = [
  {
    key: "brief",
    label: "Brief",
    title: "Confirm the client angle",
    description: "Start with the business type, location, offer angle, and what the homepage should make clear.",
    icon: FileText,
  },
  {
    key: "direction",
    label: "Direction",
    title: "Choose a website direction",
    description: "Pick an original category-matched composition, then open advanced controls only when you need them.",
    icon: Palette,
  },
  {
    key: "launch",
    label: "Finish",
    title: "Personalise and share",
    description: "Tune the key copy, review the complete homepage, and export or share it with the prospect.",
    icon: Rocket,
  },
];

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
  { value: "5", label: "5 sections", description: "Quick landing page for fast client review." },
  { value: "7", label: "7 sections", description: "Balanced homepage with services, proof, and CTA." },
  { value: "9", label: "9 sections", description: "Full homepage with visual proof and service sections." },
  { value: "11", label: "11 sections", description: "Richer mockup for higher-ticket website deals." },
];

const IMAGE_OPTIONS: Option[] = [
  { value: "abstract", label: "Brand visuals", description: "Graphic brand treatment with fewer photo-heavy sections." },
  { value: "gallery", label: "Service gallery", description: "Relevant visual cards for services, proof, and work examples." },
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

function promptInputValue(value: string | null | undefined) {
  return (value ?? "").replace(/\r\n/g, "\n").slice(0, 720);
}

function cleanPrompt(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 720);
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

function optionLabel(options: Option[], value: string) {
  return options.find(option => option.value === value)?.label ?? value;
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
    variation: options.variation,
  });

  if (data.website) params.set("website", data.website);
  if (data.maps) params.set("maps", data.maps);
  if (options.prompt) params.set("prompt", options.prompt);
  if (options.headline) params.set("headline", options.headline);
  if (options.subheadline) params.set("subheadline", options.subheadline);
  if (options.cta) params.set("cta", options.cta);
  if (/^#[0-9a-f]{6}$/i.test(options.accent)) params.set("accent", options.accent);
  return params.toString();
}

function promptIncludes(prompt: string, terms: string[]) {
  const normalized = prompt.toLowerCase();
  return terms.some(term => normalized.includes(term));
}

function inferDesignOptionsFromPrompt(prompt: string, current: DesignOptions): DesignOptions {
  const next = { ...current, prompt: cleanPrompt(prompt) };
  if (!next.prompt) return next;

  if (promptIncludes(next.prompt, ["luxury", "premium", "high end", "high-end", "expensive", "elegant", "exclusive"])) {
    next.style = "premium";
    next.layout = "showcase";
    next.sections = "9";
    next.contentDepth = "detailed";
  }
  if (promptIncludes(next.prompt, ["bold", "loud", "energetic", "stand out", "punchy", "strong contrast"])) {
    next.style = "bold";
    next.layout = "conversion";
  }
  if (promptIncludes(next.prompt, ["creative", "funky", "playful", "colourful", "colorful", "different", "memorable"])) {
    next.style = "creative";
    next.images = "gallery";
  }
  if (promptIncludes(next.prompt, ["friendly", "family", "neighbourhood", "neighborhood", "warm", "local feel", "approachable"])) {
    next.style = "friendly";
  }
  if (promptIncludes(next.prompt, ["minimal", "simple", "clean", "fast", "no clutter", "straight to the point"])) {
    next.style = "minimal";
    next.sections = "5";
    next.contentDepth = "short";
    next.layout = "conversion";
  }
  if (promptIncludes(next.prompt, ["serious", "professional", "trust", "credible", "corporate", "established"])) {
    next.style = "professional";
  }

  if (promptIncludes(next.prompt, ["light", "white", "bright", "airy"])) next.theme = "light";
  if (promptIncludes(next.prompt, ["dark", "black", "midnight", "premium dark"])) next.theme = "dark";

  if (promptIncludes(next.prompt, ["before after", "before-and-after", "transformation", "case study", "proof"])) next.images = "before-after";
  if (promptIncludes(next.prompt, ["gallery", "photos", "photo", "images", "portfolio", "show work"])) next.images = "gallery";
  if (promptIncludes(next.prompt, ["no images", "text only", "text-first"])) next.images = "none";
  if (promptIncludes(next.prompt, ["brand visuals", "abstract", "graphic"])) next.images = "abstract";

  if (promptIncludes(next.prompt, ["call", "phone", "ring", "tap to call"])) next.conversionGoal = "calls";
  if (promptIncludes(next.prompt, ["quote", "estimate", "enquiry", "inquiry", "lead form"])) next.conversionGoal = "quotes";
  if (promptIncludes(next.prompt, ["book", "booking", "appointment", "schedule"])) next.conversionGoal = "bookings";
  if (promptIncludes(next.prompt, ["visit", "walk in", "directions", "store", "shop"])) next.conversionGoal = "visits";

  if (promptIncludes(next.prompt, ["story", "editorial", "brand story", "magazine"])) next.layout = "editorial";
  if (promptIncludes(next.prompt, ["showcase", "visual", "portfolio", "gallery-led"])) next.layout = "showcase";
  if (promptIncludes(next.prompt, ["conversion", "sales", "landing page", "lead gen", "cta"])) next.layout = "conversion";

  if (promptIncludes(next.prompt, ["full", "complete", "long", "detailed", "all sections"])) {
    next.sections = "11";
    next.contentDepth = "detailed";
  }
  if (promptIncludes(next.prompt, ["balanced", "not too long", "medium"])) {
    next.sections = "7";
    next.contentDepth = "balanced";
  }

  return next;
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
  icon: ElementType;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: string;
}) {
  return (
    <section className="web-design-option-card rounded-2xl border border-border bg-background/45 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary-light">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">{title}</h2>
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
              className={`web-design-option-button min-h-[96px] rounded-2xl border p-3.5 text-left transition ${
                active
                  ? "is-active border-primary/60 bg-primary/15 shadow-glow"
                  : "border-border bg-surface/70 hover:border-primary/35 hover:bg-primary/8"
              }`}
            >
              <span className={`text-sm font-black ${active ? "text-primary-light" : "text-foreground"}`}>
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

function VariationPicker({
  value,
  onChange,
  onShuffle,
}: {
  value: string;
  onChange: (value: string) => void;
  onShuffle: () => void;
}) {
  const selected = resolveDesignVariation({ variationId: value });

  return (
    <section className="web-design-variation-card rounded-2xl border border-primary/25 bg-primary/10 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border border-primary/25 bg-background/60 text-primary-light">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">Design feel</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Choose one of {DESIGN_VARIATIONS.length} original category-aware directions, or let the prompt pick it automatically.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onShuffle}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-background/60 px-4 py-3 text-sm font-black text-primary-light transition hover:border-primary/60 hover:bg-primary/15"
        >
          <Shuffle className="h-4 w-4" />
          Surprise me
        </button>
      </div>

      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-background/75 px-4 py-3 text-base font-bold text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      >
        {DESIGN_VARIATIONS.map(variationOption => (
          <option key={variationOption.id} value={variationOption.id}>
            {variationOption.label}
          </option>
        ))}
      </select>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="web-design-recipe-card rounded-2xl border border-border bg-surface/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-light">{selected.badge}</p>
          <h3 className="mt-2 text-lg font-black text-foreground">{selected.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.summary}</p>
        </div>
        <div className="web-design-recipe-card rounded-2xl border border-border bg-surface/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Palette</p>
          <div className="mt-3 flex gap-2">
            {[selected.palette.accent, selected.palette.accent2, selected.palette.previewBackground, selected.palette.previewSurface].map(color => (
              <span
                key={color}
                className="h-10 flex-1 rounded-xl border border-white/10"
                style={{ background: color }}
              />
            ))}
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{selected.texture}</p>
        </div>
      </div>
    </section>
  );
}

function WebDesignBuilderContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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
  const initialVariation = resolveDesignVariation({
    variationId: clean(searchParams.get("variation")),
    prompt: cleanPrompt(searchParams.get("prompt")),
    company: data.company,
    category: data.category,
    location: data.location,
  });
  const initialPatch = variationToOptionPatch(initialVariation);

  const [style, setStyle] = useState(() => optionValue(searchParams.get("style"), STYLE_OPTIONS, initialPatch.style));
  const [theme, setTheme] = useState(() => optionValue(searchParams.get("theme"), THEME_OPTIONS, initialPatch.theme));
  const [sections, setSections] = useState(() => optionValue(searchParams.get("sections"), SECTION_OPTIONS, initialPatch.sections));
  const [images, setImages] = useState(() => optionValue(searchParams.get("images"), IMAGE_OPTIONS, initialPatch.images));
  const [contentDepth, setContentDepth] = useState(() => optionValue(searchParams.get("contentDepth"), CONTENT_OPTIONS, initialPatch.contentDepth));
  const [conversionGoal, setConversionGoal] = useState(() => optionValue(searchParams.get("conversionGoal"), GOAL_OPTIONS, initialPatch.conversionGoal));
  const [layout, setLayout] = useState(() => optionValue(searchParams.get("layout"), LAYOUT_OPTIONS, initialPatch.layout));
  const [designPrompt, setDesignPrompt] = useState(() => promptInputValue(searchParams.get("prompt")));
  const [variation, setVariation] = useState(() => initialVariation.id);
  const [headline, setHeadline] = useState(() => clean(searchParams.get("headline")));
  const [subheadline, setSubheadline] = useState(() => clean(searchParams.get("subheadline")));
  const [cta, setCta] = useState(() => clean(searchParams.get("cta")));
  const [accent, setAccent] = useState(() => {
    const value = clean(searchParams.get("accent"));
    return /^#[0-9a-f]{6}$/i.test(value) ? value : "";
  });

  const options = useMemo<DesignOptions>(() => ({
    style,
    theme,
    sections,
    images,
    contentDepth,
    conversionGoal,
    layout,
    prompt: designPrompt,
    variation,
    headline,
    subheadline,
    cta,
    accent,
  }), [accent, contentDepth, conversionGoal, cta, designPrompt, headline, images, layout, sections, style, subheadline, theme, variation]);

  const previewHref = `/site-preview?${buildPreviewSearch(data, options)}`;
  const clientPreviewHref = `${previewHref}&client=1`;
  const pdfHref = `${previewHref}&print=1`;
  const selectedVariation = useMemo(() => resolveDesignVariation({
    variationId: variation,
    prompt: designPrompt,
    company: data.company,
    category: data.category,
    location: data.location,
  }), [data.category, data.company, data.location, designPrompt, variation]);
  const generatedIdentity = useMemo(() => getSiteDraftIdentity(data, designPrompt), [data, designPrompt]);
  const identity = useMemo(() => {
    return {
      ...generatedIdentity,
      headline: headline || generatedIdentity.headline,
      subheadline: subheadline || generatedIdentity.subheadline,
      primaryCta: cta || generatedIdentity.primaryCta,
      accent: accent || selectedVariation.palette.accent,
      accent2: selectedVariation.palette.accent2,
      accentSoft: selectedVariation.palette.accentSoft,
    };
  }, [accent, cta, generatedIdentity, headline, selectedVariation, subheadline]);
  const initials = businessInitials(data.company);
  const activeStepData = BUILDER_STEPS[activeStep] ?? BUILDER_STEPS[0]!;
  const ActiveIcon = activeStepData.icon;
  const canGoBack = activeStep > 0;
  const canGoNext = activeStep < BUILDER_STEPS.length - 1;
  const selectedSummary = [
    designPrompt ? "Prompt-led" : null,
    selectedVariation.badge,
    optionLabel(STYLE_OPTIONS, style),
    optionLabel(THEME_OPTIONS, theme),
    `${sections} sections`,
    optionLabel(GOAL_OPTIONS, conversionGoal),
  ].filter(Boolean) as string[];

  const proposalHref = `/dashboard/proposal/new?${new URLSearchParams({
    company: data.company,
    title: `Website for ${data.company}`,
    description: data.pitch,
    niche: "web-development",
    leadType: "local-business",
    url: data.maps || data.website,
  }).toString()}`;

  async function copyPreviewLink() {
    setSharing(true);
    try {
      let absoluteUrl = `${window.location.origin}${clientPreviewHref}`;
      const response = await fetch("/api/site-preview/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: buildPreviewSearch(data, options) }),
      });

      if (response.ok) {
        const payload = await response.json() as { url?: string };
        if (payload.url) absoluteUrl = payload.url;
      }

      await copyText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } finally {
      setSharing(false);
    }
  }

  function applyVariation(nextVariationId: string) {
    const nextVariation = resolveDesignVariation({ variationId: nextVariationId });
    const patch = variationToOptionPatch(nextVariation);
    setVariation(nextVariation.id);
    setStyle(patch.style);
    setTheme(patch.theme);
    setSections(patch.sections);
    setImages(patch.images);
    setContentDepth(patch.contentDepth);
    setConversionGoal(patch.conversionGoal);
    setLayout(patch.layout);
  }

  function shuffleVariation() {
    applyVariation(nextDesignVariationId(variation, `${data.company}-${data.category}-${Date.now()}`));
  }

  function applyDesignPrompt() {
    const promptedVariation = resolveDesignVariation({
      prompt: designPrompt,
      company: data.company,
      category: data.category,
      location: data.location,
    });
    const variationPatch = variationToOptionPatch(promptedVariation);
    const inferred = inferDesignOptionsFromPrompt(designPrompt, {
      ...options,
      ...variationPatch,
      variation: promptedVariation.id,
    });
    setDesignPrompt(inferred.prompt);
    setVariation(promptedVariation.id);
    setStyle(inferred.style);
    setTheme(inferred.theme);
    setSections(inferred.sections);
    setImages(inferred.images);
    setContentDepth(inferred.contentDepth);
    setConversionGoal(inferred.conversionGoal);
    setLayout(inferred.layout);
  }

  return (
    <main className="web-design-studio-page min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Link
              href="/dashboard/local-leads"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Local leads
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Web design studio</p>
              <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">Create a client-ready website concept</h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                Brief it, shape the direction, preview it, then share the concept without hunting through a crowded builder.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={clientPreviewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent/15"
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </a>
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
            >
              <Download className="h-4 w-4" />
              PDF
            </a>
            <button
              type="button"
              onClick={copyPreviewLink}
              disabled={sharing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:opacity-90"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {sharing ? "Creating link..." : copied ? "Client link copied" : "Share with client"}
            </button>
          </div>
        </div>

        <section className="web-design-hero-card rounded-2xl border border-border bg-surface/85 p-4 shadow-card">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-center">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div
                className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-lg font-black text-slate-950 shadow-glow"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200">
                    {identity.logoLabel} preview
                  </span>
                  <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-bold text-muted-foreground">
                    {data.category}
                  </span>
                  <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-bold text-muted-foreground">
                    {data.location}
                  </span>
                </div>
                <h2 className="mt-2 truncate text-xl font-black text-foreground sm:text-2xl">{data.company}</h2>
                <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{identity.pitchHook}</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {BUILDER_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const active = index === activeStep;
                const complete = index < activeStep;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`web-design-step-button flex min-h-[78px] items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      active
                        ? "is-active border-primary/60 bg-primary/15 text-foreground shadow-glow"
                        : complete
                          ? "is-complete border-accent/25 bg-accent/10 text-foreground"
                          : "border-border bg-background/55 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-background/70">
                      {complete ? <CheckCircle className="h-4 w-4 text-accent" /> : <StepIcon className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black">{step.label}</span>
                      <span className="mt-0.5 block truncate text-xs opacity-75">{step.title}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`mt-5 grid gap-5 ${activeStepData.key === "launch" ? "xl:grid-cols-[minmax(0,1fr)_390px]" : "grid-cols-1"}`}>
          <div className="web-design-shell rounded-[1.5rem] border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary-light">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Step {activeStep + 1} of {BUILDER_STEPS.length}
                </p>
                <h2 className="mt-1 text-2xl font-black text-foreground">{activeStepData.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{activeStepData.description}</p>
              </div>
            </div>

            {activeStepData.key === "brief" && (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_0.85fr]">
                <div className="web-design-prompt-panel rounded-2xl border border-primary/25 bg-primary/10 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary-light" />
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Prompt</p>
                      </div>
                      <h3 className="mt-2 text-xl font-black text-foreground">Describe the site you want to sell.</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Write it like a designer brief. Spaces and line breaks are preserved while you type.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={applyDesignPrompt}
                      disabled={!designPrompt.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-3 text-sm font-black text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Sparkles className="h-4 w-4" />
                      Apply
                    </button>
                  </div>
                  <textarea
                    value={designPrompt}
                    onChange={event => setDesignPrompt(promptInputValue(event.target.value))}
                    rows={7}
                    placeholder="Example: Create a premium but friendly auto repair website with before-and-after proof, strong local trust, quote requests as the main CTA, detailed service sections, and a clean dark visual style."
                    className="web-design-prompt-input mt-4 min-h-[230px] w-full resize-y rounded-2xl border border-border bg-background/70 px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-4">
                  <div className="web-design-brief-card rounded-2xl border border-border bg-background/55 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Client brief</p>
                    <h3 className="mt-2 text-2xl font-black text-foreground">{data.company}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{identity.subheadline}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      {[
                        ["Category", data.category],
                        ["Market", data.location],
                        ["Phone", data.phone || "Not provided"],
                        ["Website status", data.status || "Unknown"],
                      ].map(([label, value]) => (
                        <div key={label} className="web-design-mini-card rounded-xl border border-border bg-surface/65 px-3 py-2.5">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                          <p className="mt-1 break-words font-bold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="web-design-angle-card rounded-2xl border border-accent/25 bg-accent/10 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <p className="text-sm font-black text-foreground">Sales angle</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{identity.pitchHook}</p>
                    <div className="mt-4 space-y-2">
                      {identity.services.slice(0, 2).map(service => (
                          <div key={service.title} className="web-design-mini-card flex items-start gap-3 rounded-xl border border-accent/20 bg-background/40 p-3">
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                          <div>
                            <p className="text-sm font-black text-foreground">{service.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStepData.key === "direction" && (
              <div className="space-y-5">
                <VariationPicker
                  value={variation}
                  onChange={applyVariation}
                  onShuffle={shuffleVariation}
                />
                <OptionGrid
                  title="Visual direction"
                  description="Choose the first impression the prospect should feel when they open the website preview."
                  icon={Palette}
                  options={STYLE_OPTIONS}
                  value={style}
                  onChange={setStyle}
                  columns="sm:grid-cols-2 xl:grid-cols-3"
                />
                <details className="group rounded-2xl border border-border bg-background/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 font-black text-foreground">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5 text-primary-light" />
                      Advanced controls
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground group-open:hidden">Optional</span>
                    <span className="hidden text-sm font-semibold text-muted-foreground group-open:inline">Hide</span>
                  </summary>
                  <div className="space-y-5 border-t border-border p-4">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <OptionGrid
                        title="Theme"
                        description="Create either a premium dark concept or a clean light local-business site."
                        icon={theme === "dark" ? Moon : Sun}
                        options={THEME_OPTIONS}
                        value={theme}
                        onChange={setTheme}
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
                    <OptionGrid
                      title="Page structure"
                      description="Use fewer sections for quick outreach, or a fuller version when the lead looks high value."
                      icon={LayoutTemplate}
                      options={SECTION_OPTIONS}
                      value={sections}
                      onChange={setSections}
                      columns="sm:grid-cols-2 xl:grid-cols-4"
                    />
                    <OptionGrid
                      title="Image treatment"
                      description="Choose the visual proof format that fits this business."
                      icon={ImageIcon}
                      options={IMAGE_OPTIONS}
                      value={images}
                      onChange={setImages}
                      columns="sm:grid-cols-2 xl:grid-cols-4"
                    />
                    <div className="grid gap-5 lg:grid-cols-2">
                      <OptionGrid
                        title="Copy depth"
                        description="Tune the content length before sharing with the prospect."
                        icon={Wand2}
                        options={CONTENT_OPTIONS}
                        value={contentDepth}
                        onChange={setContentDepth}
                      />
                      <OptionGrid
                        title="Conversion goal"
                        description="Change the CTA language and supporting sections around the action you want."
                        icon={Phone}
                        options={GOAL_OPTIONS}
                        value={conversionGoal}
                        onChange={setConversionGoal}
                      />
                    </div>
                  </div>
                </details>
              </div>
            )}

            {activeStepData.key === "launch" && (
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-3xl border border-border bg-background/45 p-5 lg:col-span-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Quick editor</p>
                      <h3 className="mt-2 text-xl font-black text-foreground">Make the concept sound like this client</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Edit the three details prospects notice first. Leave a field blank to keep the generated version.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHeadline("");
                        setSubheadline("");
                        setCta("");
                        setAccent("");
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"
                    >
                      Use generated copy
                    </button>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Headline</span>
                      <input
                        value={headline}
                        onChange={event => setHeadline(event.target.value.slice(0, 120))}
                        placeholder={generatedIdentity.headline}
                        className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 font-semibold text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Primary button</span>
                      <input
                        value={cta}
                        onChange={event => setCta(event.target.value.slice(0, 42))}
                        placeholder={generatedIdentity.primaryCta}
                        className="mt-2 min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-3 font-semibold text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="block lg:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Supporting message</span>
                      <textarea
                        value={subheadline}
                        onChange={event => setSubheadline(event.target.value.slice(0, 280))}
                        rows={3}
                        placeholder={generatedIdentity.subheadline}
                        className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-7 text-foreground outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 lg:col-span-2">
                      <input
                        type="color"
                        value={accent || selectedVariation.palette.accent}
                        onChange={event => setAccent(event.target.value)}
                        className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                      />
                      <span>
                        <span className="block text-sm font-black text-foreground">Brand accent</span>
                        <span className="text-sm text-muted-foreground">Use a known brand colour or keep the matched palette.</span>
                      </span>
                    </label>
                  </div>
                </div>
                {[
                  {
                    title: "Open client preview",
                    copy: "See the exact shareable concept your prospect can open from a message.",
                    href: clientPreviewHref,
                    icon: ExternalLink,
                    className: "border-accent/30 bg-accent/10 text-accent",
                  },
                  {
                    title: "Full homepage PDF",
                    copy: "Export the complete homepage concept into one client-ready PDF file.",
                    href: pdfHref,
                    icon: Download,
                    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
                  },
                  {
                    title: "Write proposal",
                    copy: "Use the concept as the outreach angle for this local lead.",
                    href: proposalHref,
                    icon: Sparkles,
                    className: "border-primary/40 bg-primary/15 text-primary-light",
                  },
                ].map(action => {
                  const ActionIcon = action.icon;
                  return (
                    <a
                      key={action.title}
                      href={action.href}
                      target={action.title === "Write proposal" ? undefined : "_blank"}
                      rel={action.title === "Write proposal" ? undefined : "noopener noreferrer"}
                      className={`flex min-h-[210px] flex-col justify-between rounded-3xl border p-5 transition hover:-translate-y-0.5 ${action.className}`}
                    >
                      <ActionIcon className="h-7 w-7" />
                      <span>
                        <span className="block text-xl font-black text-foreground">{action.title}</span>
                        <span className="mt-2 block text-sm leading-6 text-muted-foreground">{action.copy}</span>
                      </span>
                    </a>
                  );
                })}

                <div className="web-design-checklist-card rounded-3xl border border-border bg-background/55 p-5 lg:col-span-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Share checklist</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {["Open the page on mobile", "Confirm phone and maps link", "Send preview with one clear ask"].map(item => (
                      <div key={item} className="web-design-mini-card flex items-center gap-3 rounded-2xl border border-border bg-surface/65 p-4">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-accent" />
                        <span className="font-bold text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => canGoBack && setActiveStep(activeStep - 1)}
                disabled={!canGoBack}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/55 px-4 py-3 text-sm font-bold text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => canGoNext ? setActiveStep(activeStep + 1) : window.open(clientPreviewHref, "_blank", "noopener,noreferrer")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 py-3 text-sm font-black text-white shadow-glow transition hover:opacity-90"
              >
                {canGoNext ? "Continue" : "Open final preview"}
                {canGoNext ? <ArrowRight className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {activeStepData.key === "launch" && (
          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <div className="web-design-preview-shell overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-card">
              <div className="web-design-window-bar border-b border-border bg-background/65 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 truncate text-xs text-muted-foreground">website preview</span>
                </div>
              </div>
              <div className="p-4">
                <div className="web-design-mini-preview relative min-h-[350px] overflow-hidden rounded-2xl border border-white/10 bg-[#071014] p-4">
                  <div
                    className="absolute inset-0 opacity-80"
                    style={{
                      background: `radial-gradient(circle at 18% 15%, ${identity.accentSoft}, transparent 34%), radial-gradient(circle at 82% 8%, ${identity.accent2}33, transparent 28%)`,
                    }}
                  />
                  <div className="relative flex min-h-[318px] flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="grid h-12 w-12 place-items-center rounded-2xl text-base font-black text-slate-950"
                        style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                      >
                        {initials}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white/60">
                        {optionLabel(STYLE_OPTIONS, style)}
                      </span>
                    </div>
                    <div className="mt-7">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">{data.category}</p>
                      <h3 className="mt-3 line-clamp-3 text-2xl font-black leading-tight text-white">{identity.headline}</h3>
                      <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/68">{identity.subheadline}</p>
                    </div>
                    <div className="mt-auto pt-5">
                      <div className="flex flex-wrap gap-2">
                        {selectedSummary.slice(0, 4).map(item => (
                          <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white/70">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-2">
                        {identity.services.slice(0, 1).map(service => (
                          <div key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                            <p className="font-black text-white">{service.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <a
                    href={clientPreviewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-black text-accent transition hover:bg-accent/15"
                  >
                    <Eye className="h-4 w-4" />
                    Client preview
                  </a>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={copyPreviewLink}
                      disabled={sharing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/55 px-4 py-3 text-sm font-bold text-muted-foreground transition hover:text-foreground"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                      {sharing ? "Creating..." : copied ? "Copied" : "Share"}
                    </button>
                    <a
                      href={pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400/15"
                    >
                      <Download className="h-4 w-4" />
                      Full PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="web-design-recipe-shell rounded-[1.5rem] border border-border bg-surface p-4 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Current recipe</p>
              <div className="mt-3 space-y-3">
                {designPrompt && (
                  <div className="rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2.5">
                    <span className="text-sm font-black text-primary-light">Prompt brief</span>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{designPrompt}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {[
                    selectedVariation.label,
                    optionLabel(STYLE_OPTIONS, style),
                    optionLabel(THEME_OPTIONS, theme),
                    optionLabel(LAYOUT_OPTIONS, layout),
                    optionLabel(SECTION_OPTIONS, sections),
                    optionLabel(IMAGE_OPTIONS, images),
                    optionLabel(GOAL_OPTIONS, conversionGoal),
                  ].map(value => (
                    <span key={value} className="rounded-full border border-border bg-background/55 px-3 py-1.5 text-xs font-bold text-foreground">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          )}
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
