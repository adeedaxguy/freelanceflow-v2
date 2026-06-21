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
          href="/auth?mode=signup"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
        >
          Start Free
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
