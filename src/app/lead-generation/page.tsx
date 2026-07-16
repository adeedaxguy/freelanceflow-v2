import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, Sparkles, Target, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LEAD_GENERATION_PAGES } from "@/data/lead-generation-pages";

const BASE_URL = "https://icloseleads.com";

export const metadata: Metadata = {
  title: "Lead Generation Pages for Freelancers | iCloseLeads",
  description:
    "Compare iCloseLeads lead generation paths for web design leads, freelance client leads, remote freelance jobs, local business leads, and businesses without websites.",
  keywords: [
    "lead generation for freelancers",
    "web design leads",
    "freelance client leads",
    "remote freelance jobs",
    "local business leads",
    "businesses without websites",
    "freelance cold outreach",
  ],
  alternates: { canonical: `${BASE_URL}/lead-generation` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/lead-generation`,
    siteName: "iCloseLeads",
    title: "Lead Generation Pages for Freelancers | iCloseLeads",
    description:
      "Find the right iCloseLeads path for web design leads, freelance client leads, remote jobs, local businesses, and no-website prospects.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads lead generation paths" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lead Generation Pages for Freelancers | iCloseLeads",
    description: "Compare high-intent lead generation workflows and run your first search free.",
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "iCloseLeads lead generation pages",
  itemListElement: LEAD_GENERATION_PAGES.map((page, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: page.metaTitle,
    url: `${BASE_URL}${page.path}`,
    description: page.metaDescription,
  })),
};

export default function LeadGenerationHubPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-bold text-primary-light">
                <Zap className="h-4 w-4" />
                Lead Generation Paths
              </div>
              <h1 className="text-4xl font-extrabold leading-tight text-foreground sm:text-6xl lg:text-7xl">
                Pick the lead path that matches what you sell.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                iCloseLeads is built around practical signup intent: web design leads, freelance client leads, remote freelance jobs, local business leads, and businesses without websites.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=signup&intent=lead-generation-hub&source=lead-generation-hero"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
                >
                  Run first lead search free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-7 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Explore platform features
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {[
              ["Search signal", "Start from a real buyer cue: hiring, no website, local demand, or contact path."],
              ["Pitch reason", "Turn each result into a specific opener instead of a generic sales message."],
              ["Follow-up system", "Save leads, draft outreach, and keep the next step visible after signup."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-border bg-surface p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-accent" />
                <h2 className="text-base font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-light">Choose one</p>
              <h2 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">High-intent pages built for signup searches</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Each page is written for visitors who are already looking for leads, not broad education.
              </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {LEAD_GENERATION_PAGES.map(page => (
                <Link key={page.slug} href={page.path} className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary/40">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary-light">
                      <Search className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-muted-foreground">
                      {page.primaryKeyword}
                    </span>
                  </div>
                  <h3 className="break-words text-xl font-extrabold text-foreground group-hover:text-primary-light">{page.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{page.metaDescription}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary-light">
                    Open page <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {[
              { icon: Target, title: "For search intent", body: "Pages match the exact phrases already appearing in Search Console." },
              { icon: Sparkles, title: "For first value", body: "Visitors see the lead type, the sample signal, and the signup action quickly." },
              { icon: CheckCircle2, title: "For measurement", body: "Signup links carry intent and source so admin and analytics can separate paths." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-border bg-surface p-6">
                <Icon className="mb-4 h-6 w-6 text-primary-light" />
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
