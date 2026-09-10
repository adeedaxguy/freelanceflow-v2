import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ListChecks,
  Route,
  Sparkles,
} from "lucide-react";
import {
  type BlogArticleSource,
  type BlogHeading,
  getArticleInternalLinks,
  getArticleOutboundLinks,
} from "@/lib/blog-seo";

interface BlogArticleEnhancementProps {
  post: BlogArticleSource;
  headings: BlogHeading[];
}

const CLIENT_ACQUISITION_SYSTEM_SLUGS = new Set([
  "freelance-client-acquisition-system",
  "freelancer-client-acquisition-system",
]);

const GOOGLE_MAPS_PROSPECTING_SLUGS = new Set([
  "google-maps-prospecting-tool-for-agencies",
]);

const GSC_INTENT_FUNNELS: Record<string, {
  title: string;
  summary: string;
  ctaLabel: string;
  intent: string;
}> = {
  "freelance-client-acquisition-system-free": {
    title: "Build the free version of the system now",
    summary: "Choose one service and market, use the weekly free lead allowance, save the evidence behind each prospect, and leave the session with a reviewed first message and follow-up date.",
    ctaLabel: "Start the free workflow",
    intent: "free-client-acquisition-system",
  },
  "freelance-client-acquisition-system-pdf": {
    title: "Turn the PDF plan into a working pipeline",
    summary: "Use the worksheet to define one offer and market, then run the lead search, qualification, proposal, and follow-up steps in the same session so the document becomes an operating plan.",
    ctaLabel: "Run the client acquisition plan",
    intent: "client-acquisition-system-pdf",
  },
  "outreach-to-businesses-with-no-website": {
    title: "Turn a missing website into a useful first step",
    summary: "Verify that the business is active, identify the customer action a website could improve, and prepare a small proof-led offer instead of sending a generic redesign pitch.",
    ctaLabel: "Find qualified website leads",
    intent: "businesses-without-websites",
  },
  "best-lead-sources-for-web-design-agencies": {
    title: "Compare lead sources with a live campaign",
    summary: "Test one source at a time, keep the niche and offer fixed, and compare qualified leads, usable contact routes, replies, and booked conversations instead of raw list size.",
    ctaLabel: "Test a web design lead source",
    intent: "web-design-lead-sources",
  },
  "find-clients-for-ai-consulting": {
    title: "Find AI consulting leads with visible workflow pain",
    summary: "Look for repetitive manual work, disconnected systems, slow reporting, or high-volume support tasks, then save the public evidence and propose one bounded automation discovery step.",
    ctaLabel: "Find AI consulting leads",
    intent: "ai-consulting-leads",
  },
  "web-design-leads-data-led-workflow": {
    title: "Move from website signal to a proposal-ready lead",
    summary: "Search one niche and city, verify the website or booking gap, save the proof, and use it to prepare a specific concept, proposal, email, or permitted call opener.",
    ctaLabel: "Search web design leads",
    intent: "web-design-leads",
  },
  "local-business-leads-scorecard-for-freelancers": {
    title: "Score the next local lead before you contact it",
    summary: "Use activity, customer-path friction, service fit, public contact routes, and a credible first offer to decide whether a local business belongs in the pipeline.",
    ctaLabel: "Open local lead search",
    intent: "local-lead-scorecard",
  },
  "proposal-ready-leads-for-freelancers": {
    title: "Prepare one lead for a real proposal",
    summary: "Keep the source, business signal, buyer fit, contact path, offer angle, and next action together so the proposal starts from evidence rather than a blank template.",
    ctaLabel: "Build a proposal-ready lead",
    intent: "proposal-ready-leads",
  },
  "600-free-leads-week-client-acquisition-plan": {
    title: "Use the 600-lead allowance as a qualification budget",
    summary: "Split the weekly allowance across focused searches, reject weak matches early, and measure saved qualified leads, reviewed outreach, replies, and follow-ups instead of celebrating exports.",
    ctaLabel: "Start with 600 leads free",
    intent: "600-free-leads-plan",
  },
  "600-free-leads-weekly-sprint-for-web-designers": {
    title: "Run a focused web design lead sprint",
    summary: "Choose one service-business niche, find active companies with a visible website or conversion gap, and turn the strongest evidence into a small audit, concept, proposal, or call opener.",
    ctaLabel: "Start the web design sprint",
    intent: "600-web-design-leads",
  },
};

const CLIENT_ACQUISITION_SYSTEM_VISUALS = [
  {
    src: "/blog-images/freelancer-client-acquisition-system-funnel.svg",
    alt: "A freelance client acquisition funnel from search intent to qualified lead outreach",
    title: "The client acquisition funnel",
    caption: "Map the article idea to a simple signup path: choose a market, find leads, qualify them, and launch the first pitch.",
  },
  {
    src: "/blog-images/freelancer-client-acquisition-system-lead-search.svg",
    alt: "A lead search workflow showing niche, location, signal, and contact filters",
    title: "Lead search filters that matter",
    caption: "Turn broad advice into searchable filters so visitors can immediately look for businesses that need outreach.",
  },
  {
    src: "/blog-images/freelancer-client-acquisition-system-qualification-scorecard.svg",
    alt: "A qualification scorecard for prioritizing freelance client prospects",
    title: "Qualification before outreach",
    caption: "Show readers how to score leads by fit, urgency, evidence, and contactability before spending time on outreach.",
  },
  {
    src: "/blog-images/freelancer-client-acquisition-system-outreach-proof.svg",
    alt: "A personalized outreach draft connected to client acquisition proof points",
    title: "Pitch from proof, not templates",
    caption: "Connect each lead to a reason for outreach so the next step feels practical instead of generic.",
  },
  {
    src: "/blog-images/freelancer-client-acquisition-system-follow-up-loop.svg",
    alt: "A follow-up loop showing replies, reminders, and client acquisition outcomes",
    title: "Follow-up closes the loop",
    caption: "Give readers a visual reason to sign up and keep the acquisition workflow organized inside iCloseLeads.",
  },
];

const GENERIC_LEAD_WORKFLOW_VISUALS = (post: BlogArticleSource) => {
  const title = post.title || "this lead workflow";
  return [
    {
      src: "/blog-images/freelancer-client-acquisition-system-funnel.svg",
      alt: `A funnel diagram for ${title}`,
      title: "Search intent to signup path",
      caption: "Connect the article topic to a real lead workflow instead of leaving the reader with passive advice.",
    },
    {
      src: "/blog-images/freelancer-client-acquisition-system-lead-search.svg",
      alt: `Lead search filters related to ${title}`,
      title: "Lead search filters",
      caption: "Show how the reader can move from a keyword idea into niche, location, signal, and contact filters.",
    },
    {
      src: "/blog-images/freelancer-client-acquisition-system-qualification-scorecard.svg",
      alt: `A qualification scorecard for ${title}`,
      title: "Qualification scorecard",
      caption: "Make the next decision visible: which leads are worth saving, pitching, or skipping.",
    },
    {
      src: "/blog-images/freelancer-client-acquisition-system-outreach-proof.svg",
      alt: `An outreach proof diagram for ${title}`,
      title: "Pitch from proof",
      caption: "Tie the first message to a visible business signal so the CTA feels useful and specific.",
    },
    {
      src: "/blog-images/freelancer-client-acquisition-system-follow-up-loop.svg",
      alt: `A follow-up loop for ${title}`,
      title: "Follow-up loop",
      caption: "Give readers a visual path from saved lead to proposal, follow-up, and outcome tracking.",
    },
  ];
};

const CLIENT_ACQUISITION_SYSTEM_FUNNEL = {
  title: "Turn this search into a 21-day client sprint",
  summary:
    "Use this guide as a focused 21-day sprint: choose one market, use the free lead allowance, save only qualified leads with proof, then generate a proposal and follow-up from one workflow.",
  ctaLabel: "Start with 600 leads free",
  proofNote:
    "Built for searchers who want a working client system, not generic advice. Start with one focused search, a saved proof note, and a reviewed pitch path that can keep moving for the next 30 days.",
  steps: [
    {
      title: "Pick the offer and 21-day market",
      detail: "Choose the niche, service, city, or buyer type you want to win before opening more tabs or copying outreach examples.",
    },
    {
      title: "Run local and live lead search",
      detail: "Find prospects with website gaps, hiring cues, contact paths, and visible improvement signals you can reference in the first message.",
    },
    {
      title: "Save proof-led prospects",
      detail: "Keep only the leads that match your offer, contact route, business reason, and outreach angle instead of building a blind list.",
    },
    {
      title: "Generate the pitch and 30-day follow-up",
      detail: "Turn the saved lead into a specific message, reviewed proposal, and scheduled next step so the pipeline keeps moving after the first sprint.",
    },
  ],
};

const GOOGLE_MAPS_PROSPECTING_FUNNEL = {
  title: "Turn one local market into a qualified campaign",
  summary:
    "Choose one service and city, review public business signals, save only the strongest fits, and keep the proposal or reviewed outreach attached to the original lead.",
  ctaLabel: "Search 600 leads free",
  proofNote:
    "A listing is not automatically a lead. The workflow below keeps activity, customer path, offer fit, contact route, and the next action visible before outreach.",
  steps: [
    {
      title: "Define the market",
      detail: "Choose one city, business category, service offer, and customer action before opening profiles.",
    },
    {
      title: "Verify the public signal",
      detail: "Confirm the business is active and record one visible website, booking, quote, trust, or contact-path need.",
    },
    {
      title: "Save only qualified leads",
      detail: "Keep the source, reason, contact route, and offer angle together instead of exporting an unverified list.",
    },
    {
      title: "Prepare the next action",
      detail: "Create a reviewed proposal, email, permitted phone opener, or website concept and schedule follow-up.",
    },
  ],
};

function isClientAcquisitionSystemPost(post: BlogArticleSource) {
  return CLIENT_ACQUISITION_SYSTEM_SLUGS.has(post.slug);
}

function getDefaultConversionFunnel(post: BlogArticleSource) {
  if (GOOGLE_MAPS_PROSPECTING_SLUGS.has(post.slug)) {
    return {
      ...GOOGLE_MAPS_PROSPECTING_FUNNEL,
      ctaHref: `/auth?mode=signup&intent=${encodeURIComponent(post.slug)}&source=organic-google-maps-guide`,
    };
  }

  const gscFunnel = GSC_INTENT_FUNNELS[post.slug];
  if (gscFunnel) {
    return {
      eyebrow: "From search to action",
      title: gscFunnel.title,
      summary: gscFunnel.summary,
      ctaLabel: gscFunnel.ctaLabel,
      ctaHref: `/auth?mode=signup&intent=${encodeURIComponent(gscFunnel.intent)}&source=gsc-priority-guide`,
      proofNote: "Start with one focused search and one qualified lead. Review every proposal, email, and call plan before it is used.",
      steps: [
        { title: "Choose one market", detail: "Keep the service, niche, location, and buyer problem specific enough to review each result." },
        { title: "Verify the signal", detail: "Open the public source, confirm the business is active, and record the exact reason the lead fits." },
        { title: "Prepare the first value", detail: "Use a small audit, proposal, website concept, email draft, or permitted call opener that matches the evidence." },
        { title: "Schedule the follow-up", detail: "Save the lead, review the message manually, and record the next action before starting another search." },
      ],
    };
  }

  if (!isClientAcquisitionSystemPost(post)) return null;

  return {
    ...CLIENT_ACQUISITION_SYSTEM_FUNNEL,
    ctaHref: `/auth?mode=signup&intent=${encodeURIComponent(post.slug)}&source=organic-client-acquisition-guide`,
  };
}

function getDefaultArticleVisuals(post: BlogArticleSource) {
  return isClientAcquisitionSystemPost(post) ? CLIENT_ACQUISITION_SYSTEM_VISUALS : GENERIC_LEAD_WORKFLOW_VISUALS(post);
}

function InternalOrExternalLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

export function BlogArticleRoadmap({ post, headings }: BlogArticleEnhancementProps) {
  const internalLinks = getArticleInternalLinks(post, 4);
  const topFunnel = post.conversionFunnel ?? getDefaultConversionFunnel(post);
  const summary = post.excerpt?.trim()
    || `A practical guide to ${post.title.toLowerCase()} with the steps, examples, and next actions worth using in iCloseLeads.`;

  return (
    <aside className="my-10 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <p className="mb-5 border-b border-border pb-4 text-sm leading-6 text-foreground"><strong>Current offer:</strong> Try iCloseLeads free for 3 days with up to 600 shared lead results, then choose Pro ($10/month) or Agency ($15/month). Older articles may reference a previous weekly allowance. <Link href="/pricing" className="font-semibold text-primary-light underline">View current plans</Link>.</p>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Quick answer</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
            {topFunnel && (
              <Link
                href={topFunnel.ctaHref}
                className="mt-4 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-glow-primary transition-colors hover:bg-primary-light"
              >
                {topFunnel.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {headings.length > 0 && (
          <div className="rounded-2xl border border-border bg-surface/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ListChecks className="h-4 w-4 text-primary-light" />
              In this guide
            </div>
            <nav className="grid gap-2 sm:grid-cols-2" aria-label="Article table of contents">
              {headings.map(heading => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground ${
                    heading.level === 3 ? "sm:ml-3" : ""
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {internalLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-border bg-surface/70 p-4 transition-colors hover:border-primary/35 hover:bg-primary/5"
            >
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
                {link.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary-light" />
              </span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">{link.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}


export function BlogLeadSearchFunnel({ post }: { post: BlogArticleSource }) {
  const funnel = post.conversionFunnel ?? getDefaultConversionFunnel(post);
  if (!funnel) return null;

  return (
    <section className="my-10 overflow-hidden rounded-2xl border border-primary/25 bg-surface p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{funnel.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{funnel.summary}</p>
          {funnel.proofNote && (
            <p className="mt-4 rounded-xl border border-border bg-background/45 p-3 text-xs font-semibold leading-5 text-muted-foreground">
              {funnel.proofNote}
            </p>
          )}
          <Link
            href={funnel.ctaHref}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition-colors hover:bg-primary-light"
          >
            {funnel.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ol className="grid border-t border-border lg:border-l lg:border-t-0">
          {funnel.steps.map((step, index) => (
            <li key={step.title} className="border-b border-border p-4 last:border-b-0 lg:px-5">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-black text-accent">
                  {index + 1}
                </span>
                <div>
                  <strong className="text-sm text-foreground">{step.title}</strong>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BlogArticleVisuals({ post }: { post: BlogArticleSource }) {
  const visualSource = post.articleVisuals?.length ? post.articleVisuals : getDefaultArticleVisuals(post);
  const visuals = visualSource.slice(0, 5);
  if (!visuals.length) return null;

  return (
    <section className="my-10" aria-label="Article visual examples">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-light">Visual workflow</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">See the system before you build it</h2>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{visuals.length} article visuals</span>
      </div>
      <div className="grid gap-4">
        {visuals.map((visual) => (
          <figure key={visual.src} className="overflow-hidden rounded-2xl border border-border bg-surface/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual.src}
              alt={visual.alt}
              width={1200}
              height={675}
              loading="lazy"
              decoding="async"
              className="aspect-[16/9] w-full bg-background object-cover"
            />
            {(visual.title || visual.caption) && (
              <figcaption className="border-t border-border bg-background/45 p-4">
                {visual.title && <strong className="block text-sm text-foreground">{visual.title}</strong>}
                {visual.caption && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{visual.caption}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function BlogConversionPanel({ post }: { post: BlogArticleSource }) {
  const primaryLinks = getArticleInternalLinks(post, 2);

  return (
    <section className="mt-12 rounded-2xl border border-accent/25 bg-accent/5 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Apply this inside iCloseLeads
          </div>
          <h2 className="text-2xl font-bold text-foreground">Turn the article into a lead workflow</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use the idea from this guide to find prospects, save only the best opportunities, prepare a specific pitch, and keep the follow-up attached to the original lead. Free users can start with 600 lead searches, then use the first saved lead as the test.
          </p>
        </div>
        <Link
          href={`/auth?mode=signup&intent=${encodeURIComponent(post.slug)}&source=blog-conversion-panel`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
        >
          Try Free for 3 Days
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {primaryLinks.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {primaryLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-border bg-background/40 p-4 text-sm font-semibold text-foreground transition-colors hover:border-accent/35"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {link.label}
              </span>
              <span className="mt-2 block text-xs font-normal leading-5 text-muted-foreground">{link.description}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function BlogTrustedReferences({ post }: { post: BlogArticleSource }) {
  const links = getArticleOutboundLinks(post, 3);

  if (!links.length) return null;

  return (
    <section className="mt-12 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Route className="h-4 w-4 text-primary-light" />
        Trusted references
      </div>
      <div className="grid gap-3">
        {links.map(link => (
          <InternalOrExternalLink
            key={link.href}
            href={link.href}
            label={link.label}
            className="group rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/35"
          >
            <span className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
              {link.label}
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary-light" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">{link.description}</span>
          </InternalOrExternalLink>
        ))}
      </div>
    </section>
  );
}
