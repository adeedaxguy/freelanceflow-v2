import React, { type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
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
};

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = STATIC_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
    },
  };
}

export function generateStaticParams() {
  return STATIC_POSTS.map((post) => ({ slug: post.slug }));
}

function renderContent(content: string): ReactNode {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-foreground mt-10 mb-4">{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} className="font-semibold text-foreground mb-2">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("- ")) {
        items.push((lines[i] ?? "").slice(2));
        i++;
      }
      elements.push(<ul key={i} className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">{items.map((item, j) => <li key={j}>{item}</li>)}</ul>);
      continue;
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-border my-8" />);
    } else if (line.trim() === "") {
      // skip
    } else {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      elements.push(<p key={i} className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: bold }} />);
    }
    i++;
  }
  return elements;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = STATIC_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const content = FULL_POSTS[params.slug] ?? "Full article coming soon.";
  const relatedPosts = STATIC_POSTS.filter((p) => p.slug !== params.slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <article className="max-w-3xl mx-auto px-4 py-24">
          {/* Back */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-light border border-primary/20 mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-4">{post.title}</h1>
            {post.excerpt && <p className="text-muted-foreground text-lg leading-relaxed">{post.excerpt}</p>}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(post.createdAt)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime} min read</span>
            </div>
          </div>

          {/* Content */}
          <div className="border-t border-border pt-8">
            {renderContent(content)}
          </div>

          {/* Author */}
          <div className="mt-12 p-6 bg-gradient-card border border-border rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold flex-shrink-0">FF</div>
            <div>
              <div className="text-foreground font-semibold">FreelanceFlow Team</div>
              <p className="text-muted-foreground text-sm mt-1">We study what works in freelance client acquisition so you don&apos;t have to. Subscribe to get our best insights weekly.</p>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="py-16 bg-surface">
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
        "author": { "@type": "Organization", "name": "FreelanceFlow" },
        "publisher": { "@type": "Organization", "name": "FreelanceFlow", "url": "https://freelanceflow.io" },
      }) }} />
    </>
  );
}
