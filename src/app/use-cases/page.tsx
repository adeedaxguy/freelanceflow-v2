import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, Sparkles, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { USE_CASE_PAGES } from "@/data/use-case-pages";

const BASE_URL = "https://icloseleads.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Freelance Lead Generation Use Cases: Remote, Local, and Live Leads",
  description:
    "Explore iCloseLeads use cases for remote job leads, local business leads, and live job leads. Find better prospects, generate AI proposals, and track every follow-up.",
  keywords: [
    "freelance lead generation use cases",
    "remote job leads",
    "local business leads",
    "live job leads",
    "find freelance clients",
    "AI proposals for freelancers",
  ],
  alternates: { canonical: `${BASE_URL}/use-cases` },
  openGraph: {
    title: "Freelance Lead Generation Use Cases | iCloseLeads",
    description:
      "Remote job leads, local business leads, and live job leads in one client acquisition workflow.",
    url: `${BASE_URL}/use-cases`,
    type: "website",
    siteName: "iCloseLeads",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Lead Generation Use Cases",
    description:
      "Find remote, local, and live opportunities, then turn each lead into outreach and pipeline.",
  },
};

function UseCasesJsonLd() {
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Freelance Lead Generation Use Cases",
      description:
        "A collection of iCloseLeads use cases for freelancers searching for remote job leads, local business leads, and live job leads.",
      url: `${BASE_URL}/use-cases`,
      isPartOf: {
        "@type": "WebSite",
        name: "iCloseLeads",
        url: BASE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "iCloseLeads use cases",
      itemListElement: USE_CASE_PAGES.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.eyebrow,
        url: `${BASE_URL}${page.path}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Use Cases", item: `${BASE_URL}/use-cases` },
      ],
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

export default function UseCasesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <UseCasesJsonLd />
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-light">
              <Search className="h-4 w-4" />
              Use Cases
            </div>
            <h1 className="mx-auto max-w-4xl break-words text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Three focused ways to find freelance clients
            </h1>
            <p className="mx-auto mt-6 max-w-2xl break-words text-lg leading-8 text-muted-foreground">
              iCloseLeads is built around the three prospecting motions freelancers search for most: remote job leads, local business leads, and live job leads. Pick the path that matches how you sell.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/auth?mode=signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/features/lead-discovery" className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-7 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Explore Lead Discovery
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {USE_CASE_PAGES.map((page, index) => {
              const Icon = index === 0 ? Target : index === 1 ? Search : Sparkles;
              return (
                <Link key={page.slug} href={page.path} className="group min-w-0 rounded-lg border border-border bg-surface p-6 transition-all hover:border-primary/40">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary-light">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">{page.eyebrow}</p>
                  <h2 className="mt-3 break-words text-xl font-extrabold text-foreground group-hover:text-primary-light">{page.metaTitle}</h2>
                  <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">{page.metaDescription}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {page.keywords.slice(0, 4).map(keyword => (
                      <span key={keyword} className="max-w-full break-words rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-light">
                    Read use case
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-light">Why It Works</p>
              <h2 className="mt-3 break-words text-3xl font-extrabold text-foreground">Built around specific prospecting intent</h2>
              <p className="mt-4 break-words text-base leading-7 text-muted-foreground">
                Instead of one broad product page, each guide answers a concrete client-acquisition problem with a clear workflow, examples, and next steps.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Each use case has a distinct topic cluster and canonical URL.",
                "The copy answers user intent directly instead of repeating generic SaaS claims.",
                "Structured data describes the page, FAQs, breadcrumbs, and software offer.",
                "Internal links connect homepage, footer, features, and use case pages.",
              ].map(item => (
                <div key={item} className="min-w-0 break-words rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mb-3 h-4 w-4 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
