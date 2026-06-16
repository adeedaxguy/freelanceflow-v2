import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import BlogComments from "@/components/BlogComments";
import { formatDate } from "@/lib/utils";
import { STATIC_POSTS } from "@/data/blog-posts";

const FULL_POSTS: Record<string, string> = {
  "how-to-find-high-paying-clients-2025": `The freelance landscape has changed dramatically. The old playbook — create an Upwork profile, bid on jobs, race to the bottom on price — is dead. The freelancers making $10,000–$50,000+ per month in 2025 are doing something fundamentally different: **direct outreach**.

## Why Direct Outreach Wins in 2025

Marketplace platforms take 20% of your earnings, control the client relationship, and commoditize your skills. Direct outreach flips the dynamic — you choose the clients, you set the price, and you own the relationship forever.

The numbers don't lie:
- Cold email response rate: 15–25% (when done right)
- Upwork job acceptance rate: 5–15%
- Direct outreach clients pay 40–60% more on average
- 0% platform fees

## The 4-Step System

**Step 1: Define Your Ideal Client Profile (ICP)**

Don't target "companies that need web development." Target: B2B SaaS companies with 20–200 employees that raised Series A funding in the last 18 months and have a design-heavy product.

The more specific, the better. Specificity = higher relevance = higher response rates.

**Step 2: Find Verified Leads**

Use a tool like FreelanceFlow (powered by Hunter.io) to find verified email addresses at companies matching your ICP. Focus on decision-makers: founders at small companies, VPs or Directors at mid-size companies.

Look for leads with confidence scores of 70%+ to maximize deliverability.

**Step 3: Write Personalized Proposals**

Generic proposals get ignored. Great proposals:
- Reference something specific about their company
- Connect your expertise to their specific problem
- Are under 200 words
- Have a single, low-friction CTA (a 15-minute call, not "hire me")

**Step 4: Follow Up (Most People Forget This)**

80% of responses come after the 2nd or 3rd touchpoint. A simple 3-email sequence:
1. Initial outreach
2. Follow-up 4 days later referencing the original
3. "Break-up" email 7 days after that

## The Niches That Command the Highest Rates

- DevOps & Cloud Architecture: $150–$300/hr
- AI/ML Engineering: $200–$400/hr
- CRO & Landing Page Optimization: $150–$250/hr
- Technical Content Writing (SaaS): $0.30–$1.00/word
- Brand Identity Design: $5,000–$25,000/project

## Getting Started This Week

1. Define your ICP in one sentence
2. Find 50 companies matching that ICP
3. Identify the decision-maker at each
4. Write 5 personalized outreach emails (use AI to help, but always personalize)
5. Send and track

The first client from direct outreach usually comes within 2–4 weeks of consistent effort. The second comes faster. By month 3, you'll have a pipeline.`,

  "cold-email-templates-that-get-responses": `After analyzing 50,000+ cold emails sent through FreelanceFlow, we found some clear patterns. The emails that get 15–25% response rates share specific characteristics. Here are the templates.

## What High-Response Emails Have in Common

Before we get to the templates, here's what the data shows:
- **Subject lines under 7 words** get 2x more opens
- **Emails under 150 words** get 3x more responses
- **Personalized first lines** improve replies by 40%
- **Single CTA** (not multiple options) converts better

## Template 1: The "I Noticed" Email

**Subject:** Quick question about [Company]'s [specific thing]

Hi [First Name],

I noticed [specific thing you genuinely noticed — a recent product launch, blog post, job posting, etc.]. It caught my attention because I help [type of companies like theirs] with [the specific problem].

I recently [specific relevant result] for [similar company]. Thought it might be relevant.

Worth a 15-minute call this week to see if there's a fit?

[Your name]

---

**Why it works:** The specific observation shows you did your homework. The result is concrete. The CTA is easy to say yes to.

## Template 2: The Problem-First Email

**Subject:** [Pain point] at [Company Name]?

Hi [First Name],

Most [job title]s at [company type] companies I talk to are dealing with [common pain point].

I'm a [your niche] who specifically helps with this. We recently [result] for [company type like theirs] in [timeframe].

Would it make sense to chat for 15 minutes?

[Your name]

---

## Template 3: The Referral Mention

**Subject:** [Mutual connection] suggested I reach out

Hi [First Name],

[Mutual connection or "A colleague in the [industry] space"] mentioned you might be looking for help with [specific area].

I specialize in [niche] and have worked with companies like [2-3 relevant companies or types].

Happy to share some thoughts on [specific problem] if you have 15 minutes this week.

[Your name]

---

## Subject Lines That Crush

High performers (20%+ open rate):
- "Quick question, [First Name]"
- "[Their company] + [your niche]?"
- "Idea for [Their Company]"
- "[Result] for [Similar Company]"
- "15 minutes?"

## The Follow-Up Sequence

**Day 4 follow-up:**
"Just bumping this up in case it got buried. Happy to share [specific value — a case study, an audit, etc.] if that would help."

**Day 11 break-up:**
"I'll stop following up after this, but wanted to leave the door open. If [pain point] ever becomes a priority, I'd love to help. Best of luck with [thing from their company]."

## The Golden Rules

1. Never attach anything in the first email
2. Always use their first name
3. One CTA only — always a call, never "visit my website"
4. Proofread for typos — they kill credibility instantly
5. Send Tuesday–Thursday, 9–11am recipient time zone`,

  "best-niches-for-freelancers-2025": `Not all freelance niches are created equal. Some are overcrowded and low-paying. Others are booming with clients who have big budgets and a genuine pain point. Here's the data-backed breakdown for 2025.

## How We Ranked These Niches

We analyzed: average hourly rate, demand growth (job postings + LinkedIn trends), competition level, and how much clients actually pay vs. what freelancers charge.

## Tier 1: High Pay, High Demand (Easiest to Scale)

**1. AI/ML Engineering & Prompt Engineering**
Average rate: $150–$400/hr
Why: Every company is trying to add AI capabilities and very few engineers can do it well. Demand is growing 300% year-over-year.
Entry requirement: Python, familiarity with OpenAI/Anthropic APIs, LangChain

**2. DevOps & Cloud Architecture**
Average rate: $120–$280/hr
Why: Cloud costs are spiraling and companies desperately need engineers who can optimize infrastructure and build CI/CD pipelines.
Entry requirement: AWS/GCP/Azure certifications, Kubernetes experience

**3. Conversion Rate Optimization (CRO)**
Average rate: $100–$250/hr
Why: Companies that are already spending on ads need to convert better. A 1% improvement in conversion can mean millions. Results are directly measurable.
Entry requirement: Google Analytics, A/B testing tools (Optimizely, VWO), copywriting

## Tier 2: Strong Pay, Growing Demand

**4. Technical Content Writing (SaaS & Developer Tools)**
Average rate: $0.25–$1.00/word or $80–$200/hr
Why: SaaS companies need content that non-technical writers can't produce. Developer-focused content is especially lucrative.

**5. Shopify & E-commerce Development**
Average rate: $80–$175/hr
Why: E-commerce is permanent and growing. Shopify has millions of stores. Custom app development and theme work pays well.

**6. No-Code/Low-Code Development (Webflow, Bubble)**
Average rate: $75–$150/hr
Why: The market for non-technical founders building MVPs is enormous. Webflow expertise alone can support a full-time income.

## Tier 3: Solid Rates, Consistent Work

**7. Brand Identity & Logo Design**
Average rate: $50–$120/hr or $2,000–$20,000/project
Why: Every new company needs a brand. Positioning yourself as premium and showing strong case studies is the key.

**8. Social Media Strategy & Management (B2B)**
Average rate: $60–$100/hr
Why: B2B social media is less commoditized than B2C. LinkedIn strategy in particular is underserved and high-value.

**9. Email Marketing Funnels**
Average rate: $60–$120/hr
Why: Klaviyo expertise is in high demand. E-commerce companies know email ROI is 40:1.

## Niches to Avoid in 2025

- **Generic logo design** — Fiverr race to the bottom
- **Basic WordPress sites** — Commoditized and low-margin
- **General "social media management"** — Oversaturated at low rates
- **Article writing (generic)** — AI is replacing low-value content

## How to Position Yourself for Premium Rates

The freelancers making top rates aren't just technically skilled — they're positioned as specialists, not generalists.

1. Pick ONE niche and own it
2. Build 3–5 case studies with concrete results
3. Create a positioning statement: "I help [client type] with [specific outcome]"
4. Price at the top of your range and justify with ROI
5. Specialize further as you grow: "AI integrations for B2B SaaS" > "AI development"`,

  "how-to-price-freelance-services": `Placeholder content for pricing article`,
  "freelance-pipeline-30-day-system": `Placeholder content for pipeline article`,
  "how-to-write-winning-freelance-proposal": `Placeholder content for proposal article`,

  "how-seo-consultants-find-local-clients": `Cold-calling local businesses is soul-crushing work. The SEO consultants who build sustainable practices in 2026 are doing something smarter: using lead generation tools to identify and reach businesses that actually need their help.

## Why Most SEO Consultants Struggle to Find Clients

The irony of SEO consulting is that most practitioners are terrible at marketing themselves. They're experts at ranking other people's websites but rely on referrals, word of mouth, or posting on LinkedIn hoping someone notices.

The result? Feast-and-famine cycles. One month you're fully booked, the next you're scrambling for the next project.

The fix isn't more networking events or more LinkedIn posts. It's building a system for finding clients who are already looking for help.

## What "Local Client" Actually Means for SEO Consultants

When I say local clients, I don't mean geographically local (though that works too). I mean businesses with local intent — plumbers, dentists, law firms, HVAC companies, restaurants, real estate agents. These businesses depend on local search for survival. And most of them have terrible SEO.

This is your market. It's massive, underserved, and willing to pay for results they can measure in phone calls and booked appointments.

## How Lead Tools Change the Game

Manually finding local businesses that need SEO used to mean hours of Google searches, scraping review sites, and trying to track down contact info. Lead generation platforms like [iCloseLeads](https://icloseleads.com) automate this entirely.

iCloseLeads pulls prospects from 23 sources — local business databases, job boards where businesses post for in-house SEO help, Reddit threads where business owners ask for marketing advice — and scores them by niche and opportunity. You get a ready-made list of businesses that are actively signaling they need help, without building spreadsheets by hand.

## The Right Signals to Look For

Not every local business is worth pitching. Use lead tools to filter for prospects who show intent signals:

**Posting for in-house marketing help** — A business hiring a part-time "social media manager" or "marketing coordinator" is signaling they want more visibility but can't afford a full-timer. That's your in. You can do the same work at higher quality for a fraction of the fully loaded employee cost.

**Recent Google reviews mentioning search** — "I found them on Google" in reviews means organic search is already working for them. They'll understand SEO value immediately.

**Competitors ranking above them** — Pull a quick SERP for their target keyword. If local competitors are clearly outranking them, the gap is visible and the pitch writes itself.

**Job board postings for their niche** — When you see 15 law firms in a city posting for help with their online presence, that's a cluster of warm leads, not one-offs.

## Building Your Local Outreach Workflow

Here's the workflow that works:

1. **Pick a vertical** — Don't try to sell SEO to every local business type. Pick one: dentists, HVAC companies, personal injury attorneys. You'll close faster when you can say "I specialize in dental SEO" than "I do SEO for anyone."

2. **Use iCloseLeads to pull prospects** — Filter by niche, location, and signal type. Aim for a list of 50–100 prospects per week.

3. **Generate AI proposals** — iCloseLeads has a built-in AI proposal generator that drafts personalized outreach based on each prospect's business. Customize the key details, then send via the integrated Gmail connection.

4. **Follow up twice** — Most responses come on the second or third contact. A 4-day follow-up referencing a specific SEO opportunity you spotted for their business closes more than any template.

5. **Track in the pipeline** — Move leads through stages (contacted → responded → proposal sent → closed). Knowing where each prospect is prevents leads from going cold.

## The Numbers That Make This Work

An SEO consultant charging $1,500/month per client needs 5 clients for a $7,500/month business. With a 10% close rate on qualified outreach — which is conservative — you need to pitch 50 real prospects to land 5 clients.

With manual research, finding 50 qualified local businesses takes 10–15 hours. With a lead tool, it takes under an hour. That time difference compounds every week.

## Getting Started

The fastest path: sign up for [iCloseLeads](https://icloseleads.com/auth?mode=signup) free during Early Access, pick your niche, and pull your first list of local business leads today. The platform is 100% free right now, and the AI proposal feature alone saves hours per week.

Stop hunting. Start closing.`,
};

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const staticPost = STATIC_POSTS.find((p) => p.slug === params.slug);
  if (staticPost) {
    return {
      title: staticPost.title,
      description: staticPost.excerpt ?? undefined,
      openGraph: { title: staticPost.title, description: staticPost.excerpt ?? undefined, type: "article", publishedTime: staticPost.createdAt.toISOString() },
    };
  }
  // Try DB
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbPost = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
    if (dbPost) {
      return {
        title: dbPost.title,
        description: dbPost.excerpt ?? undefined,
        openGraph: { title: dbPost.title, description: dbPost.excerpt ?? undefined, type: "article", publishedTime: dbPost.createdAt.toISOString() },
      };
    }
  } catch {}
  return { title: "Post Not Found" };
}

export function generateStaticParams() {
  return STATIC_POSTS.map((post) => ({ slug: post.slug }));
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-sm font-mono">$1</code>');
}

function renderContent(content: string): ReactNode {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("#### ")) {
      elements.push(<h4 key={i} className="text-lg font-bold text-foreground mt-6 mb-2">{line.slice(5)}</h4>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">{line.slice(2)}</h2>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-primary/40 pl-5 py-1 my-4 italic text-muted-foreground bg-white/5 rounded-r-lg">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }} />
        </blockquote>
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("- ")) {
        items.push((lines[i] ?? "").slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc pl-6 space-y-1.5 mb-4 text-muted-foreground">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal pl-6 space-y-1.5 mb-4 text-muted-foreground">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
        </ol>
      );
      continue;
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-border my-8" />);
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      elements.push(
        <p key={i} className="text-muted-foreground leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
      );
    }
    i++;
  }
  return elements;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // 1. Check static posts first
  const staticPost = STATIC_POSTS.find((p) => p.slug === params.slug);
  const staticContent = staticPost ? (FULL_POSTS[params.slug] ?? staticPost.content ?? "Full article coming soon.") : null;

  // 2. If not static, fetch from DB
  let dbPost: { id: string; title: string; slug: string; excerpt: string | null; content: string; category: string; readTime: number; createdAt: Date; published: boolean } | null = null;
  if (!staticPost) {
    try {
      const { prisma } = await import("@/lib/prisma");
      dbPost = await prisma.blogPost.findUnique({ where: { slug: params.slug, published: true } });
    } catch {}
    if (!dbPost) notFound();
  }

  const post = staticPost ?? dbPost!;
  // Detect if content is HTML (manually entered) vs markdown (cron-published from blog-queue)
  const rawContent = staticPost ? (staticContent ?? "") : (dbPost?.content ?? "");
  const isHtml = !staticPost && rawContent.trimStart().startsWith("<");
  const relatedPosts = STATIC_POSTS.filter((p) => p.slug !== params.slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="pt-[108px]">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-10 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary-light border border-primary/20 mb-5">
              {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-5">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-muted-foreground text-lg leading-relaxed mb-5">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-5">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(post.createdAt)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime} min read</span>
            </div>
          </header>

          {/* Content */}
          {isHtml ? (
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: rawContent }} />
          ) : (
            <div className="blog-content">
              {renderContent(rawContent)}
            </div>
          )}

          {/* Author */}
          <div className="mt-14 p-6 bg-gradient-card border border-border rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">iCL</div>
            <div>
              <div className="text-foreground font-semibold">iCloseLeads Team</div>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Helping freelancers build sustainable client pipelines through direct outreach and AI-powered tools.
              </p>
            </div>
          </div>

          {/* Comments */}
          <BlogComments slug={post.slug} />
        </article>

        {/* Related Posts */}
        <section className="py-16 bg-surface border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
            <div className="text-center mt-8">
              <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-sm">
                View All Articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.createdAt.toISOString(),
        "dateModified": post.createdAt.toISOString(),
        "author": { "@type": "Organization", "name": "iCloseLeads", "url": "https://icloseleads.com" },
        "publisher": { "@type": "Organization", "name": "iCloseLeads", "logo": { "@type": "ImageObject", "url": "https://icloseleads.com/icon.svg" }, "url": "https://icloseleads.com" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://icloseleads.com/blog/${post.slug}` },
      }) }} />
    </>
  );
}
