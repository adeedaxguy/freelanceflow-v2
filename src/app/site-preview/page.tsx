import type { CSSProperties } from "react";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
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
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clean(value: string | string[] | undefined, fallback = "") {
  const next = (firstParam(value) ?? "").replace(/\s+/g, " ").trim();
  return (next || fallback).slice(0, 260);
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

export default function SitePreviewPage({ searchParams }: { searchParams?: SearchParams }) {
  const company = clean(searchParams?.company, "Local Business");
  const category = clean(searchParams?.category, "Local service");
  const location = clean(searchParams?.location, "Your area");
  const address = clean(searchParams?.address);
  const phone = clean(searchParams?.phone);
  const maps = safeHttpUrl(searchParams?.maps);
  const website = safeHttpUrl(searchParams?.website);
  const pitch = clean(searchParams?.pitch);
  const data = {
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
  const identity = getSiteDraftIdentity(data);
  const initials = businessInitials(company);
  const market = marketFromLocation(location);
  const callLink = telHref(phone);
  const heroPitch = pitch || identity.subheadline;

  const themeVars = {
    "--site-accent": identity.accent,
    "--site-accent-2": identity.accent2,
    "--site-accent-soft": identity.accentSoft,
  } as CSSProperties;

  return (
    <main className="min-h-screen bg-[#070b12] text-white" style={themeVars}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:54px_54px]" />
        <div
          className="absolute inset-x-0 top-0 h-[560px] opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 18%, ${identity.accentSoft}, transparent 34%), radial-gradient(circle at 78% 4%, ${identity.accent2}33, transparent 30%)`,
          }}
        />
        <div className="absolute bottom-0 left-1/2 h-80 w-[80vw] -translate-x-1/2 rounded-full blur-3xl" style={{ background: identity.accentSoft }} />

        <div className="relative mx-auto flex min-h-[820px] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
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
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/45">{identity.logoLabel} site concept</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 sm:flex">
              <ShieldCheck className="h-4 w-4" style={{ color: identity.accent }} />
              Private preview
            </div>
          </header>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-bold text-white/75">
                <Sparkles className="h-4 w-4" style={{ color: identity.accent }} />
                {identity.eyebrow}
              </div>
              <h1 className="max-w-4xl break-words text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                {identity.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-white/72">{heroPitch}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {callLink && (
                  <a
                    href={callLink}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-black text-slate-950 transition hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                  >
                    <Phone className="h-5 w-5" />
                    {identity.primaryCta}
                  </a>
                )}
                {maps && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-lg font-bold text-white transition hover:bg-white/10"
                  >
                    <MapPin className="h-5 w-5" />
                    {identity.secondaryCta}
                  </a>
                )}
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {identity.proof.map(item => (
                  <div key={`${item.value}-${item.label}`} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
                    <p className="text-2xl font-black" style={{ color: identity.accent }}>{item.value}</p>
                    <p className="mt-1 text-sm leading-5 text-white/55">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-5 rounded-[2.5rem] opacity-60 blur-2xl"
                style={{ background: `linear-gradient(135deg, ${identity.accentSoft}, ${identity.accent2}22)` }}
              />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1220]">
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

                    <div className="mt-5 grid gap-3">
                      {identity.services.slice(0, 3).map(service => (
                        <div key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" style={{ color: identity.accent }} />
                            <h3 className="font-black">{service.title}</h3>
                          </div>
                          <p className="text-sm leading-6 text-white/62">{service.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-y border-white/10 bg-white/[0.035]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: identity.accent }}>
              Website built around real buying intent
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">What the new site should make obvious</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {identity.services.map(service => (
              <article key={service.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: identity.accentSoft }}>
                  <Award className="h-6 w-6" style={{ color: identity.accent }} />
                </div>
                <h3 className="text-xl font-black">{service.title}</h3>
                <p className="mt-3 leading-7 text-white/60">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
          <MessageCircle className="mb-5 h-8 w-8" style={{ color: identity.accent }} />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/45">Customer confidence</p>
          <blockquote className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            "{identity.testimonial.quote}"
          </blockquote>
          <p className="mt-5 font-bold text-white/65">{identity.testimonial.name}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {identity.trustBadges.map(badge => (
              <span key={badge} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-bold text-white/70">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: identity.accent }}>
            Simple conversion path
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">How visitors become enquiries</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {identity.process.map(item => (
              <div key={item.step} className="rounded-3xl border border-white/10 bg-[#0b1220] p-5">
                <p className="text-sm font-black" style={{ color: identity.accent }}>{item.step}</p>
                <h3 className="mt-3 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white/45">Suggested pages</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {identity.pages.map(page => (
                <span key={page} className="rounded-full px-3 py-2 text-sm font-bold text-slate-950" style={{ background: identity.accent }}>
                  {page}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div
          className="overflow-hidden rounded-[2rem] border border-white/10 p-8 text-center sm:p-12"
          style={{ background: `linear-gradient(135deg, ${identity.accentSoft}, rgba(255,255,255,0.045))` }}
        >
          <Clock className="mx-auto mb-5 h-8 w-8" style={{ color: identity.accent }} />
          <h2 className="text-3xl font-black sm:text-5xl">Ready to win more work in {market}?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
            The page is built to make {company} easier to trust, easier to understand, and easier to contact from a phone.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {callLink && (
              <a
                href={callLink}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black text-slate-950"
                style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
              >
                <Phone className="h-5 w-5" />
                {identity.primaryCta}
              </a>
            )}
            {maps && (
              <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-4 font-bold text-white">
                <MapPin className="h-5 w-5" />
                View location
              </a>
            )}
            {!callLink && !maps && (
              <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black text-slate-950" style={{ background: identity.accent }}>
                See services <ArrowRight className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
