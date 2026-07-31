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
  title: "Turn this guide into a real prospect list",
  summary:
    "Choose the market you want to serve, find businesses and jobs with visible demand, save the strongest matches, and prepare a specific first pitch inside iCloseLeads.",
  ctaLabel: "Find my first leads free",
  proofNote:
    "No card required. Start with one focused search and keep every next step attached to the lead.",
  steps: [
    {
      title: "Pick a market",
      detail: "Choose the niche, service, city, or client type you want to win.",
    },
    {
      title: "Run lead search",
      detail: "Find prospects with websites, contact paths, and visible improvement signals.",
    },
    {
      title: "Save qualified prospects",
      detail: "Keep only the leads that match your offer, budget signals, and outreach angle.",
    },
    {
      title: "Generate the pitch",
      detail: "Turn the saved lead into a specific first message and follow-up workflow.",
    },
  ],
};

function isClientAcquisitionSystemPost(post: BlogArticleSource) {
  return CLIENT_ACQUISITION_SYSTEM_SLUGS.has(post.slug);
}

function getDefaultConversionFunnel(post: BlogArticleSource) {
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
  const summary = post.excerpt?.trim()
    || `A practical guide to ${post.title.toLowerCase()} with the steps, examples, and next actions worth using in iCloseLeads.`;

  return (
    <aside className="my-10 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Quick answer</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
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
            Use the idea from this guide to find prospects, save only the best opportunities, prepare a specific pitch, and keep the follow-up attached to the original lead.
          </p>
        </div>
        <Link
          href={`/auth?mode=signup&intent=${encodeURIComponent(post.slug)}&source=blog-conversion-panel`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
        >
          Run a free lead search
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
