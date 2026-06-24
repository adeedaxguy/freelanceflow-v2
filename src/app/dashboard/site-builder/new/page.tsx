"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Copy,
  ExternalLink,
  Globe2,
  MapPin,
  MonitorSmartphone,
  Palette,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
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

function clean(value: string | null, fallback = "") {
  const next = (value ?? "").replace(/\s+/g, " ").trim();
  return (next || fallback).slice(0, 220);
}

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function buildPreviewSearch(data: DraftData) {
  const params = new URLSearchParams({
    company: data.company,
    category: data.category,
    location: data.location,
    address: data.address,
    phone: data.phone,
    pitch: data.pitch,
    status: data.status,
  });

  if (data.website) params.set("website", data.website);
  if (data.maps) params.set("maps", data.maps);
  return params.toString();
}

function SiteBuilderContent() {
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

  const previewHref = `/site-preview?${buildPreviewSearch(data)}`;
  const identity = useMemo(() => getSiteDraftIdentity(data), [data]);
  const initials = businessInitials(data.company);
  const services = identity.services;

  async function copyPreviewLink() {
    const absoluteUrl = `${window.location.origin}${previewHref}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/local-leads"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Local leads
          </Link>
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
          <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                <Palette className="h-3.5 w-3.5" />
                {identity.logoLabel} website draft
              </div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div
                  className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-3xl text-2xl font-black text-slate-950 shadow-glow"
                  style={{ background: `linear-gradient(135deg, ${identity.accent}, ${identity.accent2})` }}
                >
                  {initials}
                </div>
                <div>
                  <h1 className="max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-5xl">
                    Shareable website concept for {data.company}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    {identity.pitchHook}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <Globe2 className="mb-3 h-5 w-5 text-primary-light" />
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Business type</p>
                  <p className="mt-1 font-bold text-foreground">{data.category}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <MapPin className="mb-3 h-5 w-5 text-accent" />
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Market</p>
                  <p className="mt-1 font-bold text-foreground">{data.location}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4">
                  <MonitorSmartphone className="mb-3 h-5 w-5 text-cyan-300" />
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Format</p>
                  <p className="mt-1 font-bold text-foreground">Mobile-first beta</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-background/60 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-light" />
                  <h2 className="text-lg font-extrabold text-foreground">Draft angle</h2>
                </div>
                <p className="text-muted-foreground">{data.pitch || identity.subheadline}</p>
              </div>
            </div>

            <aside className="border-t border-border bg-background/50 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <h2 className="text-xl font-black text-foreground">What this draft includes</h2>
              <div className="mt-5 space-y-3">
                {services.map((service) => (
                  <div key={service.title} className="flex items-center gap-3 rounded-2xl border border-border bg-surface/70 p-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="font-semibold text-foreground">{service.title}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                <div className="flex items-center gap-2 text-yellow-300">
                  <ShieldCheck className="h-5 w-5" />
                  <p className="font-extrabold">Review before sending</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The preview is not indexed by search engines and should be checked for fit before sharing with a prospect.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-3xl border border-border bg-surface p-4 shadow-card sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Preview</p>
                <h2 className="mt-1 text-2xl font-black text-foreground">Client-facing concept</h2>
              </div>
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
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
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">{data.category}</p>
                    <h3 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
                      {identity.headline}
                    </h3>
                    <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
                      {identity.subheadline}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {data.phone && (
                        <a href={`tel:${data.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950">
                          <Phone className="h-4 w-4" />
                          Call now
                        </a>
                      )}
                      {data.maps && (
                        <a href={data.maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 font-bold text-white">
                          <MapPin className="h-4 w-4" />
                          Find us
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {services.map((service) => (
                    <div key={service.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <Award className="mb-3 h-5 w-5" style={{ color: identity.accent }} />
                      <p className="font-bold text-white">{service.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-border bg-surface p-6 shadow-card">
            <h2 className="text-xl font-black text-foreground">Next pitch move</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <Rocket className="mb-3 h-5 w-5 text-primary-light" />
                <p className="font-bold text-foreground">Send the preview after a short opener.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Mention the visible website gap, then share the beta link as a concrete example.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Business profile</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {data.address && <p>{data.address}</p>}
                  {data.phone && <p>{data.phone}</p>}
                  {data.website && <p className="truncate">{data.website}</p>}
                </div>
              </div>
              <Link
                href={`/dashboard/proposal/new?${new URLSearchParams({
                  company: data.company,
                  title: `Website for ${data.company}`,
                  description: data.pitch,
                  niche: "web-development",
                  leadType: "local-business",
                  url: data.maps || data.website,
                }).toString()}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-3 font-black text-white transition hover:opacity-90"
              >
                <Sparkles className="h-5 w-5" />
                Write proposal for this site
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default function NewSiteBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-6 text-foreground">Loading website draft...</div>}>
      <SiteBuilderContent />
    </Suspense>
  );
}
