import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, MessageSquare, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getResourcePage, RESOURCE_PAGES } from "@/data/resource-pages";

const BASE_URL = "https://icloseleads.com";

interface Props {
  params: { slug: string };
}

type ResourcePageData = NonNullable<ReturnType<typeof getResourcePage>>;

function getResourceSignalScorecard(page: ResourcePageData) {
  return [
    {
      label: "Fit signal",
      detail: `The lead should match the ${page.keyword} intent and make sense for ${page.audience.toLowerCase()}.`,
      action: "Save it only when the business problem, buyer type, and service angle are clear enough to explain in one sentence.",
    },
    {
      label: "Proof signal",
      detail: `Look for public context that supports the page promise: ${page.intent.toLowerCase()}`,
      action: "Attach the profile, site, job post, or contact-route proof before drafting outreach so the pitch stays specific.",
    },
    {
      label: "Risk filter",
      detail: "Reject blind lists, scraped records, fake exclusivity claims, spammy sources, and any lead that cannot be verified from public context.",
      action: "Use iCloseLeads to keep the verified signal, draft, and follow-up together instead of chasing volume for its own sake.",
    },
  ];
}

export function generateStaticParams() {
  return RESOURCE_PAGES.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getResourcePage(params.slug);
  if (!page) return { title: "Resource Not Found" };

  return {
    metadataBase: new URL(BASE_URL),
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [page.keyword, "freelance lead generation", "iCloseLeads", "client acquisition"],
    alternates: { canonical: `${BASE_URL}/resources/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${BASE_URL}/resources/${page.slug}`,
      type: "article",
      siteName: "iCloseLeads",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

function ResourceJsonLd({ page }: { page: ResourcePageData }) {
  const url = `${BASE_URL}/resources/${page.slug}`;
  const scorecard = getResourceSignalScorecard(page);
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.metaTitle,
      description: page.metaDescription,
      author: { "@type": "Organization", name: "iCloseLeads" },
      publisher: { "@type": "Organization", name: "iCloseLeads", url: BASE_URL },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "iCloseLeads",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BASE_URL,
      audience: { "@type": "Audience", audienceType: page.audience },
      featureList: [
        "Lead discovery",
        "Saved lead context",
        "AI proposal drafting",
        "Email outreach preparation",
        "CRM follow-up tracking",
      ],
      description: `iCloseLeads helps ${page.audience.toLowerCase()} find leads, save context, draft proposals, prepare outreach, and track follow-up.`,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to qualify ${page.keyword} before outreach`,
      description: `A practical scorecard for deciding whether a ${page.keyword} opportunity is worth saving, pitching, and following up inside iCloseLeads.`,
      totalTime: "PT10M",
      step: scorecard.map((item, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: item.label,
        text: `${item.detail} ${item.action}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Resources", item: `${BASE_URL}/resources` },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
      ],
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

export default function ResourcePage({ params }: Props) {
  const page = getResourcePage(params.slug);
  if (!page) notFound();
  const shortAnswer = `${page.summary} iCloseLeads helps ${page.audience.toLowerCase()} turn that workflow into a focused search, a saved lead, and a first outreach draft without bouncing between separate tools.`;
  const workflowKickoff = [
    "Create a free account and run one focused search tied to this page's keyword.",
    "Save the best lead while the map, job, or website context is still open.",
    "Turn the saved lead into a proposal draft or Gmail-ready outreach before the reason goes stale.",
  ];
  const signalScorecard = getResourceSignalScorecard(page);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <ResourceJsonLd page={page} />
      <Navbar />
      <main className="pt-16">
        <article>
          <section className="border-b border-border px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.42fr] lg:items-start">
              <div className="min-w-0">
                <Link href="/resources" className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-light">
                  <Search className="h-4 w-4" />
                  {page.keyword}
                </Link>
                <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  {page.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{page.summary}</p>
                <div className="ai-answer-box mt-6 max-w-3xl rounded-2xl border border-primary/25 bg-primary/10 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-light">Short answer</p>
                  <p className="mt-3 text-base leading-7 text-foreground">{shortAnswer}</p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=resource-hero`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition hover:bg-primary-light">
                    Start Free and Run This Workflow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href={page.internalLinks[0]?.href ?? "/features/lead-discovery"} className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                    See the workflow
                  </Link>
                </div>
              </div>
              <aside className="rounded-lg border border-border bg-surface p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Best for</p>
                <p className="mt-3 text-lg font-bold text-foreground">{page.audience}</p>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Search intent</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{page.intent}</p>
              </aside>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.72fr_0.28fr]">
              <div className="min-w-0 space-y-10">
                {page.relatedSearches?.length ? (
                  <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-2xl font-extrabold text-foreground">Searches this workflow should help with</h2>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                      This page is built to answer the commercial search variants real freelancers use before they sign up, search, and save a lead.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {page.relatedSearches.map((term) => (
                        <span key={term} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
                          {term}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                  <h2 className="flex items-center gap-3 text-2xl font-extrabold text-foreground">
                    <ClipboardList className="h-6 w-6 text-primary-light" />
                    Practical workflow
                  </h2>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">{page.leadIn}</p>
                  <div className="mt-6 grid gap-3">
                    {page.steps.map((step, index) => (
                      <div key={step} className="flex gap-4 rounded-lg border border-border bg-background p-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary-light">{index + 1}</span>
                        <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section data-resource-signal-scorecard className="rounded-lg border border-primary/25 bg-primary/10 p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-foreground">Buying-signal scorecard before outreach</h2>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">
                    Use this quick scorecard before you pitch from the {page.keyword} workflow. It keeps lead quality, proof, and follow-up tied to the same saved record.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {signalScorecard.map((item) => (
                      <div key={item.label} className="rounded-lg border border-border bg-background p-5">
                        <h3 className="text-base font-bold text-foreground">{item.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                        <p className="mt-3 rounded-lg border border-accent/20 bg-accent/10 p-3 text-sm leading-6 text-accent">
                          Next action: {item.action}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link href={`/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=resource-signal-scorecard`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-light">
                    Score a lead inside iCloseLeads
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </section>

                {page.activationPlan ? (
                  <section data-resource-activation-plan className="rounded-lg border border-accent/25 bg-accent/10 p-6 sm:p-8">
                    <h2 className="text-2xl font-extrabold text-foreground">First 10-minute run inside iCloseLeads</h2>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">{page.activationPlan.trigger}</p>
                    <div className="mt-6 grid gap-3">
                      {[
                        ["1", "Run the search", page.activationPlan.firstRun],
                        ["2", "Save the right lead", page.activationPlan.savedLead],
                        ["3", "Draft and follow up", page.activationPlan.followUp],
                      ].map(([num, title, body]) => (
                        <div key={title} className="rounded-lg border border-border bg-background p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">{num}</span>
                            <h3 className="text-base font-bold text-foreground">{title}</h3>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
                        </div>
                      ))}
                    </div>
                    <Link href={`/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=resource-activation-plan`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
                      Start free with this plan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </section>
                ) : null}

                {page.qualificationChecks?.length ? (
                  <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                    <h2 className="text-2xl font-extrabold text-foreground">Qualify the lead before you pitch</h2>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                      Generic lead vendors stop at the list. A stronger workflow verifies why the business is worth contacting before you draft the message.
                    </p>
                    <div className="mt-6 grid gap-4">
                      {page.qualificationChecks.map((check) => (
                        <div key={check.signal} className="rounded-lg border border-border bg-background p-5">
                          <h3 className="text-base font-bold text-foreground">{check.signal}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{check.whyItMatters}</p>
                          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-primary-light">
                            Next move: {check.nextMove}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-foreground">Why this matters for iCloseLeads users</h2>
                  <div className="mt-6 grid gap-3">
                    {page.proofPoints.map((point) => (
                      <div key={point} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-primary/25 bg-primary/10 p-6 sm:p-8">
                  <h2 className="flex items-center gap-3 text-2xl font-extrabold text-foreground">
                    <MessageSquare className="h-6 w-6 text-primary-light" />
                    Starter pitch
                  </h2>
                  <p className="mt-5 rounded-lg border border-border bg-background p-5 text-base leading-8 text-muted-foreground">{page.pitch}</p>
                </section>

                <section className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-foreground">Questions people ask</h2>
                  <div className="mt-6 space-y-5">
                    {page.faqs.map((faq) => (
                      <div key={faq.q} className="border-b border-border pb-5 last:border-0 last:pb-0">
                        <h3 className="text-lg font-bold text-foreground">{faq.q}</h3>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-5">
                <div className="rounded-lg border border-border bg-surface p-6">
                  <h2 className="text-lg font-extrabold text-foreground">Use this next</h2>
                  <div className="mt-5 grid gap-3">
                    {page.internalLinks.map((link) => (
                      <Link key={link.href} href={link.href} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                        {link.label}
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-accent/25 bg-accent/10 p-6">
                  <p className="text-sm font-bold text-accent">Turn this into a real workflow</p>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                    {workflowKickoff.map((step, index) => (
                      <p key={step}>
                        {index + 1}. {step}
                      </p>
                    ))}
                  </div>
                  <Link href={`/auth?mode=signup&intent=${encodeURIComponent(page.slug)}&source=resource-workflow-panel`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
                    Start free and test the workflow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
