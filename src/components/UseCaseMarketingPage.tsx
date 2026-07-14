import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { USE_CASE_PAGES, type UseCasePageData } from "@/data/use-case-pages";

const BASE_URL = "https://icloseleads.com";

function UseCaseJsonLd({ page }: { page: UseCasePageData }) {
  const url = `${BASE_URL}${page.path}`;
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metaTitle,
      description: page.metaDescription,
      url,
      about: page.keywords.slice(0, 6),
      isPartOf: {
        "@type": "WebSite",
        name: "iCloseLeads",
        url: BASE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "iCloseLeads",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BASE_URL,
      description: page.heroSummary,
      featureList: page.signals.map(signal => signal.label),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Use Cases", item: `${BASE_URL}/use-cases` },
        { "@type": "ListItem", position: 3, name: page.eyebrow, item: url },
      ],
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
      <h2 className="mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>}
    </div>
  );
}

export default function UseCaseMarketingPage({ page }: { page: UseCasePageData }) {
  const otherUseCases = USE_CASE_PAGES.filter(item => item.slug !== page.slug);
  const shortAnswer = `${page.title} work best when you start from a real buyer signal, qualify the fit quickly, and move the best lead into a proposal and follow-up workflow. iCloseLeads gives freelancers one place to search, save, draft, and track that process.`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <UseCaseJsonLd page={page} />
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
            <div className="min-w-0">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-light">
                <Zap className="h-4 w-4" />
                {page.eyebrow}
              </div>
              <h1 className="max-w-full break-words text-3xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {page.title}{" "}
                <span className="break-words bg-gradient-to-r from-primary-light via-accent to-blue-400 bg-clip-text text-transparent">
                  {page.accentTitle}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-muted-foreground">{page.heroSummary}</p>
              <div className="mt-6 max-w-2xl rounded-2xl border border-primary/25 bg-primary/10 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-light">Short answer</p>
                <p className="mt-3 text-base leading-7 text-foreground">{shortAnswer}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=use-case-hero`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
                >
                  {page.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features/lead-discovery"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {page.secondaryCta}
                </Link>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                {[
                  ["Best for", page.audience],
                  ["Main outcome", page.outcome],
                  ["Search intent", page.searchIntent],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-border bg-background/65 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">{label}</p>
                    <p className="mt-2 break-words leading-6">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-lg border border-border bg-gradient-card p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Opportunity signals</p>
                  <p className="mt-1 text-lg font-bold text-foreground">What to prioritize</p>
                </div>
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-3">
                {page.signals.map((signal, index) => (
                  <div key={signal.label} className="min-w-0 rounded-lg border border-border bg-background/70 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary-light">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-foreground">{signal.label}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{signal.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-light">Why This Page Exists</p>
              <h2 className="mt-3 break-words text-3xl font-extrabold text-foreground">A focused path for a high-intent search</h2>
            </div>
            <div className="min-w-0 space-y-5 break-words text-base leading-8 text-muted-foreground">
              {page.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Workflow"
            title={`How to use iCloseLeads for ${page.title.toLowerCase()}`}
            description="Each page is built around a real prospecting motion: find the signal, qualify the fit, write the pitch, and keep the follow-up visible."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
            {page.workflow.map((step, index) => (
              <div key={step.title} className="min-w-0 rounded-lg border border-border bg-background p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary-light">
                    {[Search, Target, FileText, Layers][index] ? (
                      (() => {
                        const Icon = [Search, Target, FileText, Layers][index]!;
                        return <Icon className="h-5 w-5" />;
                      })()
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="break-words font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-light">Search Angles</p>
              <h2 className="mt-3 break-words text-3xl font-extrabold text-foreground">Topics this guide answers</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Each cluster reflects a practical way freelancers describe the problem when they are looking for better leads.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {page.keywordsCluster.map(cluster => (
                <div key={cluster.group} className="min-w-0 rounded-lg border border-border bg-surface p-5">
                  <h3 className="text-sm font-bold text-foreground">{cluster.group}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cluster.terms.map(term => (
                      <span key={term} className="max-w-full break-words rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
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
            eyebrow="Examples"
            title="What a good lead can look like"
            description="The strongest outreach starts from a business signal, not a generic template."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
            {page.examples.map(example => (
              <div key={example.title} className="min-w-0 rounded-lg border border-border bg-background p-5">
                <TrendingUp className="mb-4 h-5 w-5 text-accent" />
                <h3 className="break-words text-base font-bold text-foreground">{example.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{example.context}</p>
                <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-light">
                  {example.pitchAngle}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Comparison"
              title="Manual prospecting versus a focused workflow"
            />
            <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface">
              <div className="grid grid-cols-2 border-b border-border bg-background/70 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Old way</span>
                <span>iCloseLeads way</span>
              </div>
              {page.comparison.map(row => (
                <div key={row.oldWay} className="grid gap-4 border-b border-border/70 px-4 py-4 text-sm last:border-0 sm:grid-cols-2">
                  <p className="min-w-0 break-words text-muted-foreground">{row.oldWay}</p>
                  <p className="flex min-w-0 gap-2 break-words font-medium text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    {row.icloseWay}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title={`Questions about ${page.title.toLowerCase()}`} />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {page.faqs.map(faq => (
              <div key={faq.q} className="rounded-lg border border-border bg-background p-5">
                <h3 className="break-words text-base font-bold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-8 text-center">
              <Sparkles className="mx-auto mb-5 h-10 w-10 text-primary-light" />
              <h2 className="break-words text-3xl font-extrabold text-foreground">Turn the next search into a saved lead</h2>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Start with one focused query, qualify the best signal, write the first message, and keep the follow-up in one place.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={`/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=use-case-final-cta`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
                >
                  Run this workflow free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={page.dashboardPath}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-7 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {otherUseCases.map(other => (
                <Link key={other.slug} href={other.path} className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary/40">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">{other.eyebrow}</p>
                  <h3 className="mt-2 break-words text-lg font-bold text-foreground">{other.metaTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{other.metaDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
