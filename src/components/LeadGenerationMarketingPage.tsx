import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Layers,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LEAD_GENERATION_PAGES, type LeadGenerationPageData } from "@/data/lead-generation-pages";

const BASE_URL = "https://icloseleads.com";

function signupHref(page: LeadGenerationPageData, source: string) {
  return `/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=${encodeURIComponent(source)}`;
}

function LeadGenerationJsonLd({ page }: { page: LeadGenerationPageData }) {
  const url = `${BASE_URL}${page.path}`;
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metaTitle,
      description: page.metaDescription,
      url,
      about: [page.primaryKeyword, ...page.searchAngles.flatMap(group => group.terms).slice(0, 8)],
      isPartOf: {
        "@type": "WebSite",
        name: "iCloseLeads",
        url: BASE_URL,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${BASE_URL}/og-image.png`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "iCloseLeads",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BASE_URL,
      description: page.summary,
      featureList: [
        "Remote job lead discovery",
        "Local business lead discovery",
        "Decision maker path checks",
        "AI proposal drafting",
        "Gmail-ready outreach preparation",
        "Freelance CRM follow-up",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free early access account available.",
      },
      potentialAction: {
        "@type": "RegisterAction",
        target: `${BASE_URL}${signupHref(page, "lead-generation-schema")}`,
        name: page.primaryCta,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map(faq => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Lead Generation", item: `${BASE_URL}/lead-generation` },
        { "@type": "ListItem", position: 3, name: page.eyebrow, item: url },
      ],
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-light">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>}
    </div>
  );
}

export default function LeadGenerationMarketingPage({ page }: { page: LeadGenerationPageData }) {
  const relatedPages = LEAD_GENERATION_PAGES.filter(item => item.slug !== page.slug).slice(0, 3);
  const workflowIcons = [Search, Target, FileText, Layers];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LeadGenerationJsonLd page={page} />
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.86fr] lg:px-8 lg:py-24">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-bold text-primary-light">
                <Zap className="h-4 w-4" />
                {page.eyebrow}
              </div>
              <h1 className="max-w-4xl break-words text-4xl font-extrabold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
                {page.title}{" "}
                <span className="bg-gradient-to-r from-primary-light via-accent to-blue-400 bg-clip-text text-transparent">
                  {page.accentTitle}
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{page.summary}</p>

              <div className="mt-7 rounded-2xl border border-accent/25 bg-accent/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Direct answer</p>
                <p className="mt-3 text-base leading-7 text-foreground">{page.directAnswer}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={signupHref(page, "lead-generation-hero")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
                >
                  {page.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={page.internalLinks[0]?.href ?? "/features"}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-7 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {page.secondaryCta}
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Best for", page.audience],
                  ["Outcome", page.outcome],
                  ["First action", "Run one focused search and save only pitchable leads."],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="min-w-0 self-start rounded-lg border border-border bg-gradient-card p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Sample search</p>
                  <h2 className="mt-1 text-xl font-extrabold text-foreground">What a qualified lead looks like</h2>
                </div>
                <Gauge className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-3">
                {page.sampleLeads.slice(0, 2).map(lead => (
                  <div key={lead.title} className="rounded-lg border border-border bg-background/75 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 break-words text-base font-bold text-foreground">{lead.title}</h3>
                      <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                        {lead.score}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{lead.signal}</p>
                    <p className="mt-3 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-light">
                      {lead.pitchAngle}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href={signupHref(page, "lead-generation-sample-card")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-background transition-all hover:bg-accent/90"
              >
                Run this search free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {page.proofPoints.map(point => (
              <div key={point} className="rounded-lg border border-border bg-surface p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-accent" />
                <p className="text-sm leading-7 text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Workflow"
            title={`How iCloseLeads turns ${page.primaryKeyword} into outreach`}
            description="The goal is not a bigger list. The goal is a lead you can explain, verify, pitch, and follow up."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
            {page.workflow.map((step, index) => {
              const Icon = workflowIcons[index] ?? ClipboardList;
              return (
                <div key={step.title} className="rounded-lg border border-border bg-background p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary-light">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="break-words font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-light">Keyword fit</p>
              <h2 className="mt-3 break-words text-3xl font-extrabold text-foreground sm:text-4xl">
                Built for the phrases prospects actually search
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                These pages are intentionally matched to commercial searches where a visitor is already trying to find leads, not just learn theory.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {page.searchAngles.map(angle => (
                <div key={angle.group} className="rounded-lg border border-border bg-surface p-5">
                  <h3 className="text-sm font-bold text-foreground">{angle.group}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {angle.terms.map(term => (
                      <span key={term} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Lead examples"
            title="Sample signals worth acting on"
            description="Use these as the kind of evidence your first message should mention."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
            {page.sampleLeads.map(lead => (
              <article key={lead.title} className="rounded-lg border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="break-words text-base font-bold text-foreground">{lead.title}</h3>
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                    Score {lead.score}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{lead.signal}</p>
                <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-light">
                  {lead.pitchAngle}
                </p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Next move</p>
                <p className="mt-1 text-sm leading-6 text-foreground">{lead.nextStep}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeader eyebrow="Why it converts" title="Manual prospecting versus a lead workflow" />
            <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="grid grid-cols-2 border-b border-border bg-background/70 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Manual way</span>
                <span>iCloseLeads way</span>
              </div>
              {page.comparison.map(row => (
                <div key={row.manual} className="grid gap-4 border-b border-border/70 px-4 py-4 text-sm last:border-0 sm:grid-cols-2">
                  <p className="min-w-0 break-words text-muted-foreground">{row.manual}</p>
                  <p className="flex min-w-0 gap-2 break-words font-medium text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    {row.iclose}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Related paths" title="Keep moving from search to signup" />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
            {page.internalLinks.map(link => (
              <Link key={link.href} href={link.href} className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary/40">
                <Sparkles className="mb-4 h-5 w-5 text-primary-light" />
                <h3 className="text-base font-bold text-foreground">{link.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title={`Questions about ${page.primaryKeyword}`} />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {page.faqs.map(faq => (
              <div key={faq.q} className="rounded-lg border border-border bg-surface p-5">
                <h3 className="break-words text-base font-bold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {relatedPages.map(related => (
              <Link key={related.slug} href={related.path} className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">{related.eyebrow}</p>
                <h3 className="mt-2 break-words text-lg font-bold text-foreground">{related.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{related.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-border px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-lg border border-primary/25 bg-primary/10 p-8 text-center">
            <Users className="mx-auto mb-5 h-10 w-10 text-primary-light" />
            <h2 className="break-words text-3xl font-extrabold text-foreground">Run one focused search before you decide</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Create a free account, choose the lead engine that matches your service, and see whether the first results are worth pitching.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={signupHref(page, "lead-generation-final-cta")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
              >
                {page.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lead-generation"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-7 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Compare lead paths
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
