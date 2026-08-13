import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Braces, Building2, Clock3, KeyRound, Radio } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Lead Generation API for Local Businesses and Remote Jobs",
  description: "Use the iCloseLeads API to search local business leads, remote jobs, and fresh live job opportunities from your own application.",
  alternates: { canonical: "https://icloseleads.com/developers" },
};

const endpoints = [
  { method: "GET", path: "/api/v1/local-businesses", scope: "local-businesses:read", icon: Building2, description: "Search real local businesses by service, location, and website status." },
  { method: "GET", path: "/api/v1/remote-jobs", scope: "remote-jobs:read", icon: Clock3, description: "Find relevant remote work across the platform's job intelligence layer." },
  { method: "GET", path: "/api/v1/live-jobs", scope: "live-jobs:read", icon: Radio, description: "Query the freshest job and client-demand signals for selected niches." },
];

const localExample = `curl -G 'https://icloseleads.com/api/v1/local-businesses' \\
  -H 'Authorization: Bearer icl_live_...' \\
  --data-urlencode 'keyword=plumber' \\
  --data-urlencode 'location=Austin, TX' \\
  --data-urlencode 'filter=no_website' \\
  --data-urlencode 'limit=25'`;

const jobExample = `curl -G 'https://icloseleads.com/api/v1/remote-jobs' \\
  -H 'Authorization: Bearer icl_live_...' \\
  --data-urlencode 'niches=web-development,seo' \\
  --data-urlencode 'max_hours=168' \\
  --data-urlencode 'min_confidence=55'`;

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">iCloseLeads API v1</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">Lead intelligence for your own workflow.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Search local businesses, remote roles, and fresh live opportunities through one stable JSON API. Build internal tools, alerts, research pipelines, or client acquisition workflows without rebuilding the search layer.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/api" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">
                  Create an API key <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="/api/v1/openapi" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground">
                  OpenAPI specification <Braces className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="border border-border bg-surface p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <KeyRound className="h-5 w-5 text-accent" />
                <div><h2 className="font-semibold">Server-side authentication</h2><p className="text-sm text-muted-foreground">Keep keys out of browser and mobile bundles.</p></div>
              </div>
              <pre className="mt-5 overflow-x-auto bg-background p-4 text-sm leading-6 text-muted-foreground"><code>{`Authorization: Bearer icl_live_...`}</code></pre>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Access</dt><dd className="mt-1 font-semibold">Agency / admin</dd></div>
                <div><dt className="text-muted-foreground">Daily allowance</dt><dd className="mt-1 font-semibold">Agency 250 · Admin unlimited</dd></div>
                <div><dt className="text-muted-foreground">Page size</dt><dd className="mt-1 font-semibold">Up to 50 results</dd></div>
                <div><dt className="text-muted-foreground">Reset</dt><dd className="mt-1 font-semibold">00:00 UTC</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-5">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Endpoints</p><h2 className="mt-2 text-3xl font-bold">Three focused read APIs</h2></div>
              <span className="hidden text-sm text-muted-foreground sm:block">Base URL: https://icloseleads.com/api/v1</span>
            </div>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {endpoints.map(({ method, path, scope, icon: Icon, description }) => (
                <div key={path} className="grid gap-4 py-6 md:grid-cols-[1fr_1.2fr] md:items-center">
                  <div className="flex min-w-0 items-center gap-3"><Icon className="h-5 w-5 flex-none text-accent" /><span className="rounded bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{method}</span><code className="truncate text-sm font-semibold">{path}</code></div>
                  <div><p className="text-sm leading-6 text-muted-foreground">{description}</p><code className="mt-1 block text-xs text-primary-light">Scope: {scope}</code></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Local business search</p>
              <h2 className="mt-2 text-2xl font-bold">Find businesses with a reason to buy</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Required: <code>keyword</code> and <code>location</code>. Optional filters include website status, page size, and cursor.</p>
              <pre className="mt-5 overflow-x-auto border border-border bg-surface p-4 text-xs leading-6 text-muted-foreground"><code>{localExample}</code></pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Job search</p>
              <h2 className="mt-2 text-2xl font-bold">Match fresh work to one or more niches</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Pass comma-separated niche slugs, a freshness window, confidence threshold, and optional contact or urgency filters.</p>
              <pre className="mt-5 overflow-x-auto border border-border bg-surface p-4 text-xs leading-6 text-muted-foreground"><code>{jobExample}</code></pre>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/50 py-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex gap-3"><BookOpen className="mt-1 h-5 w-5 text-accent" /><div><h2 className="font-semibold">Stable contract, private sourcing</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Responses identify iCloseLeads as the data layer. Upstream credentials and supplier implementation details are never exposed.</p></div></div>
            <Link href="/dashboard/api" className="inline-flex flex-none items-center gap-2 text-sm font-semibold text-primary-light">Manage keys <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
