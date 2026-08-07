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

function normalizeResourceMetaTitle(title: string) {
  return title.replace(/\s*\|\s*iCloseLeads\s*$/i, "");
}

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

type ResourceResearchIntent = {
  searcherJob: string;
  competitorGap: string;
  workflowNudge: string;
  conversionPath: string;
};

const RESOURCE_RESEARCH_INTENT: Record<string, ResourceResearchIntent> = {
  "web-design-leads": {
    searcherJob: "Find businesses that may actually need website work, not a recycled list of agency contacts.",
    competitorGap: "Lead sellers compete on exclusivity and volume; this page needs to win on proof, website-gap verification, and a workflow that protects the first pitch from sounding generic.",
    workflowNudge: "Start with one city and one service niche, then save only leads with a visible site, profile, or contact-route reason.",
    conversionPath: "Route the visitor into local business lead search, saved lead notes, and a web design proposal draft.",
  },
  "web-design-proposal-template": {
    searcherJob: "Turn a real website lead into a proposal that names the business problem before the scope.",
    competitorGap: "Template libraries rank with broad downloadable forms; this page differentiates by tying the template to lead context and the next outreach action.",
    workflowNudge: "Use the saved lead signal as the first paragraph instead of starting with a generic agency introduction.",
    conversionPath: "Move the visitor from resource reading into AI proposal generation and a review-first email draft.",
  },
  "businesses-without-websites": {
    searcherJob: "Find local companies with enough public demand to justify a website pitch.",
    competitorGap: "Most pages stop at finding no-website businesses; this page should qualify activity, category fit, phone route, and business value before outreach.",
    workflowNudge: "Treat no website as a signal to verify, not proof that the owner wants a redesign.",
    conversionPath: "Send the visitor into local business leads, decision-maker research, and a simple first website offer.",
  },
  "freelance-cold-outreach": {
    searcherJob: "Build a cold outreach system that finds relevant prospects and avoids copy-paste messages.",
    competitorGap: "Cold outreach guides often focus on email copy; this page should win by showing how to find the right lead before writing the message.",
    workflowNudge: "Save the reason to contact the lead before drafting the first email.",
    conversionPath: "Route the visitor into lead discovery, saved context, Gmail preparation, and CRM follow-up.",
  },
  "local-business-leads-for-web-designers": {
    searcherJob: "Find nearby businesses with clear website, booking, trust, or local search gaps.",
    competitorGap: "Lead-list pages sell volume; this page should emphasize local proof, fit scoring, and the pitch angle a designer can defend.",
    workflowNudge: "Scan by city and category, then prioritize businesses where the missing website path affects calls or quotes.",
    conversionPath: "Move the visitor into local search, owner-path checks, and a web design proposal workflow.",
  },
  "exclusive-web-design-leads": {
    searcherJob: "Understand whether exclusive web design leads are safer than shared or resold leads.",
    competitorGap: "Lead vendors use exclusivity claims heavily; this page should teach verification, freshness, and proof requirements before any lead is trusted.",
    workflowNudge: "Ask what makes the lead exclusive, how fresh it is, and whether the business need is visible.",
    conversionPath: "Route the visitor to build their own verified lead list before buying someone else's.",
  },
  "outdated-website-leads": {
    searcherJob: "Spot businesses where an old website creates a practical sales angle.",
    competitorGap: "Generic redesign advice misses the prospecting step; this page should turn outdated design into calls, bookings, trust, speed, and mobile conversion proof.",
    workflowNudge: "Save the outdated page, the local profile, and the customer action that seems blocked.",
    conversionPath: "Send the visitor into website lead discovery and a redesign-specific proposal draft.",
  },
  "remote-job-leads": {
    searcherJob: "Find remote job posts early enough to pitch before the inbox is crowded.",
    competitorGap: "Job boards own the listings; this page should win by teaching speed, fit, and follow-up workflow instead of another list of boards.",
    workflowNudge: "Filter by role fit and freshness before drafting a response.",
    conversionPath: "Move the visitor into remote-job lead monitoring, saved leads, and proposal drafting.",
  },
  "remote-job-proposal-template": {
    searcherJob: "Reply to remote job leads with a proposal that feels specific to the post.",
    competitorGap: "Proposal templates are usually broad; this page should connect job-post evidence to the message structure.",
    workflowNudge: "Quote the role need, remove unrelated services, and make the next step easy.",
    conversionPath: "Route the visitor into AI proposals and review-first outreach.",
  },
  "best-lead-generation-tools-for-freelancers": {
    searcherJob: "Compare tools for finding, qualifying, saving, and following up with freelance leads.",
    competitorGap: "Tool roundups often rank by feature count; this page should rank tools by whether they produce a usable first outreach action.",
    workflowNudge: "Judge every tool by source quality, proof capture, proposal help, and follow-up tracking.",
    conversionPath: "Move the visitor into the iCloseLeads free workflow rather than passive comparison.",
  },
  "cold-outreach-crm-for-freelancers": {
    searcherJob: "Keep cold outreach leads organized without losing why each prospect was saved.",
    competitorGap: "CRM pages usually focus on pipeline stages; this page should focus on proof, context, and follow-up after the first message.",
    workflowNudge: "Store the signal, source, pitch angle, and next follow-up date together.",
    conversionPath: "Route the visitor into saved leads and CRM pipeline setup.",
  },
  "find-decision-maker-email-small-business": {
    searcherJob: "Find a business-facing route to the person who can approve website, SEO, or lead-generation work.",
    competitorGap: "Email-finder competitors compete on database size; this page should win by showing public proof and confidence labels.",
    workflowNudge: "Verify the role and source before treating an email as pitch-ready.",
    conversionPath: "Move the visitor into decision-maker research and review-first email preparation.",
  },
  "freelance-client-acquisition-software": {
    searcherJob: "Choose software that helps create a repeatable client acquisition system.",
    competitorGap: "Software pages often isolate prospecting, CRM, or email; this page should join discovery, qualification, proposal, and follow-up.",
    workflowNudge: "Start from the channel where the freelancer already sees demand, then save proof before outreach.",
    conversionPath: "Route the visitor into lead discovery plus CRM follow-up.",
  },
  "lead-generation-for-independent-contractors": {
    searcherJob: "Find contract opportunities without relying only on marketplaces or referrals.",
    competitorGap: "General lead-gen advice is broad; this page should apply lead quality checks to independent contractor workflows.",
    workflowNudge: "Choose one offer, one buyer type, and one source before saving leads.",
    conversionPath: "Move the visitor into remote jobs, local leads, and proposal workflows.",
  },
  "ai-consulting-clients": {
    searcherJob: "Find companies with a real AI adoption, automation, or process problem to pitch.",
    competitorGap: "AI consulting SERPs are full of broad thought leadership; this page should focus on buyer signals like hiring, workflow friction, and public operational gaps.",
    workflowNudge: "Look for a business process signal before pitching AI as a solution.",
    conversionPath: "Route the visitor into lead discovery, qualification notes, and a grounded AI consulting proposal.",
  },
  "decision-maker-finder": {
    searcherJob: "Find the right person or role before sending a first pitch.",
    competitorGap: "Database tools prioritize names; this page should prioritize role confidence, public proof, and business-facing routes.",
    workflowNudge: "Use the lead source to decide whether you need owner, manager, founder, or department-level context.",
    conversionPath: "Move the visitor into decision-maker lookup from a saved lead.",
  },
  "freelance-proposal-subject-lines": {
    searcherJob: "Write a subject line that gets opened without sounding like a mass campaign.",
    competitorGap: "Subject-line lists are easy to copy; this page should tie subject lines to the lead signal and offer.",
    workflowNudge: "Name the business context or useful idea in plain language.",
    conversionPath: "Route the visitor into proposal drafting and Gmail-ready outreach.",
  },
  "ai-proposal-generator-for-freelancers": {
    searcherJob: "Use AI to draft a proposal without losing the real lead context.",
    competitorGap: "Generic AI writing tools do not know why the lead matters; this page should show context-first proposal drafting.",
    workflowNudge: "Feed the saved signal, buyer type, and service angle into the draft before polishing style.",
    conversionPath: "Move the visitor into AI proposals from a saved lead.",
  },
  "freelance-client-acquisition": {
    searcherJob: "Build a client acquisition process that does not depend on one platform.",
    competitorGap: "Advice posts list channels; this page should turn channels into a daily search, save, pitch, follow-up routine.",
    workflowNudge: "Pick one acquisition source and one offer before adding more channels.",
    conversionPath: "Route the visitor into lead discovery and CRM follow-up.",
  },
  "proposal-follow-up-email": {
    searcherJob: "Follow up after a proposal without sounding pushy or starting from scratch.",
    competitorGap: "Follow-up templates often ignore the original lead reason; this page should preserve context from the first proposal.",
    workflowNudge: "Reference the original business problem and offer one low-friction next step.",
    conversionPath: "Move the visitor into CRM follow-up and Gmail preparation.",
  },
  "live-job-leads": {
    searcherJob: "Catch fresh job or project signals while they are still actionable.",
    competitorGap: "Live job boards focus on listings; this page should focus on speed, fit, saved context, and proposal readiness.",
    workflowNudge: "Open only leads that match the offer and are fresh enough to justify a fast response.",
    conversionPath: "Route the visitor into live job monitoring and proposal drafting.",
  },
  "website-design-prospecting": {
    searcherJob: "Turn website gaps into a repeatable prospecting workflow for designers.",
    competitorGap: "Prospecting guides explain where to look; this page should show what to verify before pitching.",
    workflowNudge: "Save the website gap, local proof, contact route, and pitch angle together.",
    conversionPath: "Move the visitor into web design lead search, saved proof, and proposal drafting.",
  },
};

function getResourceResearchIntent(page: ResourcePageData) {
  return page.researchIntent ?? RESOURCE_RESEARCH_INTENT[page.slug] ?? {
    searcherJob: `Find a useful, verified path for the ${page.keyword} workflow before sending outreach.`,
    competitorGap: "Competing pages often stop at advice or lists; this page should connect the search intent to a practical lead workflow.",
    workflowNudge: "Save the lead reason, proof, and next action together before drafting.",
    conversionPath: "Route the visitor into iCloseLeads lead discovery, saved context, proposal drafting, and follow-up.",
  };
}

export function generateStaticParams() {
  return RESOURCE_PAGES.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getResourcePage(params.slug);
  if (!page) return { title: "Resource Not Found" };
  const pageTitle = normalizeResourceMetaTitle(page.metaTitle);

  return {
    metadataBase: new URL(BASE_URL),
    title: pageTitle,
    description: page.metaDescription,
    keywords: [page.keyword, "freelance lead generation", "iCloseLeads", "client acquisition"],
    alternates: { canonical: `${BASE_URL}/resources/${page.slug}` },
    openGraph: {
      title: pageTitle,
      description: page.metaDescription,
      url: `${BASE_URL}/resources/${page.slug}`,
      type: "article",
      siteName: "iCloseLeads",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: page.metaDescription,
    },
  };
}

function ResourceJsonLd({ page }: { page: ResourcePageData }) {
  const url = `${BASE_URL}/resources/${page.slug}`;
  const pageTitle = normalizeResourceMetaTitle(page.metaTitle);
  const scorecard = getResourceSignalScorecard(page);
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageTitle,
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
  const researchIntent = getResourceResearchIntent(page);

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

                <section data-resource-research-intent className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-light">Search intent to satisfy</p>
                  <h2 className="mt-3 text-2xl font-extrabold text-foreground">Why this resource should exist</h2>
                  <div className="mt-5 grid gap-4">
                    {[
                      ["Searcher job", researchIntent.searcherJob],
                      ["Competitor gap", researchIntent.competitorGap],
                      ["Workflow nudge", researchIntent.workflowNudge],
                      ["Conversion path", researchIntent.conversionPath],
                    ].map(([label, body]) => (
                      <div key={label} className="rounded-lg border border-border bg-background p-4">
                        <h3 className="text-sm font-bold text-foreground">{label}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                      </div>
                    ))}
                  </div>
                </section>

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
