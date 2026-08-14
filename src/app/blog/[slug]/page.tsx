import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import BlogComments from "@/components/BlogComments";
import {
  BlogArticleRoadmap,
  BlogArticleVisuals,
  BlogConversionPanel,
  BlogLeadSearchFunnel,
  BlogTrustedReferences,
} from "@/components/BlogArticleEnhancements";
import { formatDate } from "@/lib/utils";
import { getBlogCoverImage, getBlogCoverImageUrl, isHiddenBlogSlug } from "@/lib/blog-images";
import {
  type BlogArticleSource,
  estimateWordCount,
  extractArticleHeadings,
  getRelatedStaticPosts,
  headingId,
} from "@/lib/blog-seo";
import { STATIC_POSTS } from "@/data/blog-posts";
import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/types";

export const dynamic = 'force-dynamic';

// ── Types ──────────────────────────────────────────────────────────────────────
interface DbPost {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; category: string; published: boolean;
  coverImage: string | null;
  readTime: number | null; author: string | null;
  metaTitle: string | null; metaDesc: string | null;
  focusKeyword: string | null; ogImage: string | null;
  canonical: string | null; noIndex: boolean | null;
  twitterCard: string | null; schema: string | null;
  tags: string | null; createdAt: Date; updatedAt: Date;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com";

// ── Data fetch ────────────────────────────────────────────────────────────────
async function getDbPost(slug: string): Promise<DbPost | null> {
  if (isHiddenBlogSlug(slug)) return null;
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
    });
    return post as DbPost | null;
  } catch { return null; }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Try DB post first
  const dbPost = await getDbPost(params.slug);
  if (dbPost) {
    const title   = dbPost.metaTitle  || dbPost.title;
    const desc    = dbPost.metaDesc   || dbPost.excerpt || "";
    const image   = getBlogCoverImageUrl(BASE_URL, dbPost.slug, dbPost.ogImage, dbPost.coverImage);
    const canonicalUrl = dbPost.canonical || `${BASE_URL}/blog/${dbPost.slug}`;

    return {
      title,
      description:  desc,
      keywords:     dbPost.focusKeyword ? [dbPost.focusKeyword, ...(dbPost.tags?.split(",").map(t => t.trim()) ?? [])] : undefined,
      alternates:   { canonical: canonicalUrl },
      robots:       dbPost.noIndex ? { index: false, follow: false } : { index: true, follow: true },
      openGraph: {
        title,
        description: desc,
        type: "article",
        siteName: "iCloseLeads",
        url: canonicalUrl,
        images: [{ url: image, width: 1200, height: 630 }],
        publishedTime: dbPost.createdAt instanceof Date ? dbPost.createdAt.toISOString() : String(dbPost.createdAt),
        modifiedTime:  dbPost.updatedAt instanceof Date ? dbPost.updatedAt.toISOString() : String(dbPost.updatedAt),
        tags: dbPost.tags?.split(",").map(t => t.trim()) ?? [],
      },
      twitter: {
        card: (dbPost.twitterCard as "summary" | "summary_large_image") ?? "summary_large_image",
        title,
        description: desc,
        images: [image],
      },
    };
  }

  // Fall back to static post
  const post = STATIC_POSTS.find(p => p.slug === params.slug);
  if (!post) return { title: "Post Not Found" };
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const image = getBlogCoverImageUrl(BASE_URL, post.slug, post.coverImage);
  return {
    title,
    description,
    keywords: post.focusKeyword ? [post.focusKeyword, ...(post.tags ?? [])] : undefined,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "iCloseLeads",
      url: `${BASE_URL}/blog/${post.slug}`,
      images: [{ url: image, width: 1200, height: 630 }],
      publishedTime: post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ── Static params (static posts only; DB posts rendered dynamically) ──────────
export function generateStaticParams() {
  return STATIC_POSTS
    .filter((post) => !isHiddenBlogSlug(post.slug))
    .map((post) => ({ slug: post.slug }));
}

// ── Render helpers ─────────────────────────────────────────────────────────────
const FULL_POSTS: Record<string, string> = {
  "how-to-find-high-paying-clients-2025": `The freelance landscape has changed dramatically. The old playbook — create an Upwork profile, bid on jobs, race to the bottom on price — is dead.

## Why Direct Outreach Wins in 2025

Marketplace platforms take 20% of your earnings, control the client relationship, and commoditize your skills. Direct outreach flips the dynamic — you choose the clients, you set the price, and you own the relationship forever.

- Cold email response rate: 15–25% (when done right)
- Upwork job acceptance rate: 5–15%
- Direct outreach clients pay 40–60% more on average
- 0% platform fees

## The 4-Step System

**Step 1: Define Your Ideal Client Profile (ICP)**

Don't target "companies that need web development." Target: B2B SaaS companies with 20–200 employees that raised Series A funding in the last 18 months.

**Step 2: Find Verified Leads**

Use a tool like iCloseLeads to find verified email addresses at companies matching your ICP. Focus on decision-makers.

**Step 3: Write Personalized Proposals**

Generic proposals get ignored. Great proposals reference something specific about their company, connect your expertise to their specific problem, are under 200 words, and have a single low-friction CTA.

**Step 4: Follow Up**

80% of responses come after the 2nd or 3rd touchpoint. A simple 3-email sequence over 11 days is all you need.

## Getting Started This Week

1. Define your ICP in one sentence
2. Find 50 companies matching that ICP
3. Write 5 personalized outreach emails
4. Send and track — your first response usually comes within 48 hours`,
  "cold-email-templates-that-get-responses": `After analyzing 50,000+ cold emails sent through iCloseLeads, we found clear patterns. Here are the templates that get 15–25% response rates.

## Template 1: The "I Noticed" Email

**Subject:** Quick question about [Company]'s [specific thing]

Hi [First Name],

I noticed [specific thing you genuinely noticed]. It caught my attention because I help [type of companies] with [specific problem].

I recently [specific result] for [similar company]. Thought it might be relevant.

Worth a 15-minute call this week?

[Your name]

---

## Template 2: The Problem-First Email

**Subject:** [Pain point] at [Company Name]?

Hi [First Name],

Most [job title]s I talk to are dealing with [common pain point]. I specifically help with this — we recently achieved [result] for a similar company.

Would it make sense to chat for 15 minutes?

[Your name]

## The Follow-Up Sequence

**Day 4:** "Just bumping this up in case it got buried."

**Day 11:** "I'll stop following up after this, but wanted to leave the door open."`,
  "best-niches-for-freelancers-2025": `Not all freelance niches are created equal. Here's the data-backed breakdown for 2025.

## Tier 1: High Pay, High Demand

**AI/ML Engineering** — $150–$400/hr. Demand growing 300% year-over-year.

**DevOps & Cloud Architecture** — $120–$280/hr. Cloud cost optimization is in desperate demand.

**Conversion Rate Optimization** — $100–$250/hr. Results are directly measurable; clients pay for ROI.

## Tier 2: Strong Pay, Growing Demand

**Technical Content Writing (SaaS)** — $0.25–$1.00/word. Developer-focused content pays premium.

**Shopify & E-commerce Development** — $80–$175/hr. Millions of stores, ongoing work.

**No-Code/Low-Code Development** — $75–$150/hr. Webflow, Bubble — enormous demand from non-technical founders.

## Niches to Avoid in 2025

- Generic logo design — Fiverr race to the bottom
- Basic WordPress sites — commoditized
- General "social media management" — oversaturated`,
  "how-to-price-freelance-services": `Pricing is the most consequential decision in your freelance business. Most freelancers price too low and never recover.`,
  "freelance-pipeline-30-day-system": `A consistent pipeline is the difference between a freelance business and a freelance hobby.`,
  "how-to-write-winning-freelance-proposal": `Your proposal is your sales page. Most freelancers write about themselves — winners write about the client.`,
};

function renderMarkdown(content: string): ReactNode {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  const headingCounts = new Map<string, number>();
  let i = 0;

  const getHeadingAnchor = (text: string) => {
    const baseId = headingId(text);
    const count = headingCounts.get(baseId) ?? 0;
    headingCounts.set(baseId, count + 1);
    return count ? `${baseId}-${count + 1}` : baseId;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("# ")) {
      // Stored static content sometimes includes a duplicate H1; the page title already covers it.
    } else if (line.startsWith("## ")) {
      const text = line.slice(3);
      nodes.push(<h2 key={i} id={getHeadingAnchor(text)} className="scroll-mt-28 text-2xl font-bold text-foreground mt-10 mb-4">{text}</h2>);
    } else if (line.startsWith("### ")) {
      const text = line.slice(4);
      nodes.push(<h3 key={i} id={getHeadingAnchor(text)} className="scroll-mt-28 text-xl font-semibold text-foreground mt-8 mb-3">{text}</h3>);
    } else if (line.startsWith("---")) {
      nodes.push(<hr key={i} className="border-border my-8" />);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && ((lines[i] ?? "").startsWith("- ") || (lines[i] ?? "").startsWith("* "))) {
        items.push((lines[i] ?? "").slice(2));
        i++;
      }
      nodes.push(
        <ul key={i} className="list-disc pl-6 space-y-1.5 mb-5 text-muted-foreground">
          {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />)}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\. /, ""));
        i++;
      }
      nodes.push(
        <ol key={i} className="list-decimal pl-6 space-y-1.5 mb-5 text-muted-foreground">
          {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />)}
        </ol>
      );
      continue;
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      // Detect if the whole line is bold (acting as a heading)
      if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
        nodes.push(<p key={i} className="font-semibold text-foreground mt-6 mb-2">{line.trim().slice(2, -2)}</p>);
      } else {
        const html = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g,     '<em>$1</em>')
          .replace(/`(.*?)`/g,      '<code class="px-1.5 py-0.5 rounded bg-primary/10 text-primary-light text-sm font-mono">$1</code>');
        nodes.push(<p key={i} className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: html }} />);
      }
    }
    i++;
  }
  return <>{nodes}</>;
}

function dbPostToBlogPost(post: DbPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    category: post.category,
    published: post.published,
    coverImage: getBlogCoverImage(post.slug, post.ogImage, post.coverImage),
    readTime: post.readTime ?? Math.max(4, Math.round(estimateWordCount(post.content) / 225)),
    createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(String(post.createdAt)),
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt : new Date(String(post.updatedAt)),
  };
}

async function getRelatedDbPosts(post: DbPost): Promise<BlogPost[]> {
  try {
    const related = await prisma.blogPost.findMany({
      where: {
        published: true,
        slug: { not: post.slug },
        category: post.category,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return (related as DbPost[])
      .filter(item => !isHiddenBlogSlug(item.slug) && item.excerpt?.trim().toLowerCase() !== "test excerpt")
      .map(dbPostToBlogPost);
  } catch {
    return [];
  }
}

function mergeRelatedPosts(posts: BlogPost[], limit = 3) {
  const seen = new Set<string>();
  return posts.filter(post => {
    if (isHiddenBlogSlug(post.slug)) return false;
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  }).slice(0, limit);
}

function RelatedArticlesSection({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="py-16 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">Keep reading</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Related Articles</h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            View All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(p => <BlogCard key={p.id ?? p.slug} post={p} />)}
        </div>
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: Props) {
  if (params.slug === "freelancer-client-acquisition-system") {
    permanentRedirect("/blog/freelance-client-acquisition-system");
  }

  // 1. Try DB (admin-published posts with SEO fields)
  const dbPost = await getDbPost(params.slug);
  if (dbPost) {
    const postDate = dbPost.createdAt instanceof Date ? dbPost.createdAt : new Date(String(dbPost.createdAt));
    const updDate  = dbPost.updatedAt instanceof Date ? dbPost.updatedAt  : new Date(String(dbPost.updatedAt));

    // JSON-LD schema — use custom if set, else build Article schema
    const coverImage = getBlogCoverImage(dbPost.slug, dbPost.ogImage, dbPost.coverImage);
    const coverImageUrl = getBlogCoverImageUrl(BASE_URL, dbPost.slug, dbPost.ogImage, dbPost.coverImage);
    const tagList = dbPost.tags?.split(",").map(t => t.trim()).filter(Boolean) ?? [];
    const articleSource: BlogArticleSource = {
      slug: dbPost.slug,
      title: dbPost.title,
      excerpt: dbPost.excerpt,
      content: dbPost.content,
      category: dbPost.category,
      readTime: dbPost.readTime,
      author: dbPost.author,
      createdAt: postDate,
      updatedAt: updDate,
      tags: tagList,
      focusKeyword: dbPost.focusKeyword,
    };
    const articleHeadings = extractArticleHeadings(dbPost.content);
    const relatedDbPosts = await getRelatedDbPosts(dbPost);
    const relatedStaticPosts = getRelatedStaticPosts(articleSource, STATIC_POSTS, 6);
    const relatedPosts = mergeRelatedPosts([...relatedDbPosts, ...relatedStaticPosts], 3);
    let jsonLd: object;
    try { jsonLd = JSON.parse(dbPost.schema ?? "{}") as object; } catch { jsonLd = {}; }
    if (!Object.keys(jsonLd).length) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${BASE_URL}/blog/${dbPost.slug}`,
        },
        "headline": dbPost.metaTitle || dbPost.title,
        "description": dbPost.metaDesc || dbPost.excerpt || "",
        "datePublished": postDate.toISOString(),
        "dateModified":  updDate.toISOString(),
        "author": { "@type": "Person", "name": dbPost.author || "iCloseLeads Team" },
        "publisher": { "@type": "Organization", "name": "iCloseLeads", "url": BASE_URL },
        "image": coverImageUrl,
        "articleSection": dbPost.category,
        "keywords": [dbPost.focusKeyword, ...tagList].filter(Boolean),
        "wordCount": estimateWordCount(dbPost.content),
        "isAccessibleForFree": true,
        "url": `${BASE_URL}/blog/${dbPost.slug}`,
      };
    }

    return (
      <>
        <Navbar />
        <main className="pt-16">
          <article className="max-w-3xl mx-auto px-4 py-20">
            <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-light border border-primary/20 mb-4">
                {dbPost.category}
              </span>
              <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-5">{dbPost.title}</h1>
              {dbPost.excerpt && <p className="text-muted-foreground text-xl leading-relaxed mb-5">{dbPost.excerpt}</p>}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
                {dbPost.author && (
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{dbPost.author}</span>
                )}
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(postDate)}</span>
                {dbPost.readTime && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{dbPost.readTime} min read</span>
                )}
              </div>
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tagList.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-surface border border-border text-xs text-muted-foreground">{tag}</span>
                  ))}
                </div>
              )}
            </header>

            {/* Cover image */}
            {coverImage && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt={dbPost.title} width={1200} height={630} className="w-full object-cover max-h-72" decoding="async" />
              </div>
            )}

            <BlogArticleRoadmap post={articleSource} headings={articleHeadings} />
            <BlogLeadSearchFunnel post={articleSource} />

            {/* Body */}
            <div className="prose-content">
              {renderMarkdown(dbPost.content)}
            </div>

            <BlogArticleVisuals post={articleSource} />
            <BlogConversionPanel post={articleSource} />
            <BlogTrustedReferences post={articleSource} />

            {/* Author card */}
            <div className="mt-14 p-6 bg-gradient-card border border-border rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold flex-shrink-0">
                {(dbPost.author ?? "FF").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-foreground font-semibold">{dbPost.author ?? "iCloseLeads Team"}</p>
                <p className="text-muted-foreground text-sm mt-1">Helping freelancers build sustainable client pipelines through direct outreach and AI-powered tools.</p>
              </div>
            </div>

            <BlogComments slug={dbPost.slug} />
          </article>
          <RelatedArticlesSection posts={relatedPosts} />
        </main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </>
    );
  }

  // 2. Fall back to static posts
  const post = STATIC_POSTS.find(p => p.slug === params.slug);
  if (!post) notFound();

  const content = post.content || FULL_POSTS[params.slug] || "Full article coming soon. Subscribe to be notified.";
  const postDate = post.createdAt instanceof Date ? post.createdAt : new Date(String(post.createdAt));
  const updatedDate = post.updatedAt instanceof Date ? post.updatedAt : new Date(String(post.updatedAt ?? post.createdAt));
  const coverImage = getBlogCoverImage(post.slug, post.coverImage);
  const coverImageUrl = getBlogCoverImageUrl(BASE_URL, post.slug, post.coverImage);
  const articleSource: BlogArticleSource = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content,
    category: post.category,
    readTime: post.readTime,
    author: post.author ?? "iCloseLeads Team",
    createdAt: postDate,
    updatedAt: updatedDate,
    tags: post.tags,
    focusKeyword: post.focusKeyword,
    articleVisuals: post.articleVisuals,
    conversionFunnel: post.conversionFunnel,
  };
  const articleHeadings = extractArticleHeadings(content);
  const relatedPosts = mergeRelatedPosts(getRelatedStaticPosts(articleSource, STATIC_POSTS, 6), 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
    "headline": post.metaTitle || post.title,
    "description": post.metaDescription || post.excerpt || "",
    "datePublished": postDate.toISOString(),
    "dateModified": updatedDate.toISOString(),
    "author": post.author
      ? { "@type": "Person", "name": post.author }
      : { "@type": "Organization", "name": "iCloseLeads" },
    "publisher": { "@type": "Organization", "name": "iCloseLeads", "url": BASE_URL },
    "image": coverImageUrl,
    "articleSection": post.category,
    "keywords": [post.focusKeyword, ...(post.tags ?? [])].filter(Boolean),
    "wordCount": estimateWordCount(content),
    "isAccessibleForFree": true,
    "url": `${BASE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <article className="max-w-3xl mx-auto px-4 py-20">
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <header className="mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-light border border-primary/20 mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-5">{post.title}</h1>
            {post.excerpt && <p className="text-muted-foreground text-xl leading-relaxed mb-5">{post.excerpt}</p>}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(postDate)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime} min read</span>
            </div>
          </header>

          <div className="mb-10 rounded-2xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt={post.title} width={1200} height={630} className="w-full object-cover max-h-72" decoding="async" />
          </div>

          <BlogArticleRoadmap post={articleSource} headings={articleHeadings} />
          <BlogLeadSearchFunnel post={articleSource} />

          <div className="prose-content">
            {renderMarkdown(content)}
          </div>

          <BlogArticleVisuals post={articleSource} />
          <BlogConversionPanel post={articleSource} />
          <BlogTrustedReferences post={articleSource} />

          <div className="mt-14 p-6 bg-gradient-card border border-border rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold flex-shrink-0">FF</div>
            <div>
              <p className="text-foreground font-semibold">iCloseLeads Team</p>
              <p className="text-muted-foreground text-sm mt-1">We study what works in freelance client acquisition so you don&apos;t have to. Subscribe for weekly insights.</p>
            </div>
          </div>

          <BlogComments slug={post.slug} />
        </article>

        <RelatedArticlesSection posts={relatedPosts} />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    </>
  );
}
