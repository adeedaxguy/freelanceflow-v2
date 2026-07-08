import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Check, Zap, MapPin, Target, TrendingUp } from "lucide-react";

// ── Industry definitions ──────────────────────────────────────────────────────
const INDUSTRIES: Record<string, {
  name: string;
  headline: string;
  sub: string;
  pain: string;
  useCases: string[];
  features: { icon: string; title: string; desc: string }[];
  keywords: string[];
  cta: string;
}> = {
  "web-designers": {
    name: "Web Designers",
    headline: "Find Local Businesses That Need a Website — Before Anyone Else Does",
    sub: "iCloseLeads scans live business profiles in real time to surface local businesses with no website or an outdated one. You get the lead; you make the pitch.",
    pain: "Most web designers spend more time searching for clients than doing actual design work. Cold DMing on Instagram, scrolling through job boards, or waiting for referrals is unpredictable and slow.",
    useCases: [
      "Search a local service category in your target city and build a focused list of businesses with no website",
      "Filter by 'no website detected' to find the highest-priority opportunities",
      "Export leads with phone numbers, addresses, and Google Maps links",
      "Write an AI proposal for each lead in one click",
    ],
    features: [
      { icon: "📍", title: "Local Business Search", desc: "Find businesses in any city globally with website status detected automatically." },
      { icon: "✍️", title: "AI Proposal Writer", desc: "Generate a personalised cold email for each lead based on their business type and your services." },
      { icon: "📊", title: "CRM Pipeline", desc: "Track every prospect from cold lead to signed contract in a visual Kanban board." },
      { icon: "📧", title: "Prepare in Gmail", desc: "Open Gmail with a polished draft ready to review and send manually." },
    ],
    keywords: ["find web design clients", "local web design leads", "find businesses without websites"],
    cta: "Start Finding Web Design Clients Free",
  },
  "marketing-agencies": {
    name: "Marketing Agencies",
    headline: "Find Local Businesses That Need Marketing Help — At Scale",
    sub: "iCloseLeads gives marketing agencies a live pipeline of local businesses, remote job leads, and AI-powered outreach tools — all in one place. Stop prospecting manually.",
    pain: "Agency business development is expensive. Hiring outbound help or buying lead lists still does not guarantee the leads are relevant, local, or fresh.",
    useCases: [
      "Search any industry + city and get a live list of businesses to pitch",
      "Find businesses with outdated websites as social media or SEO upsell opportunities",
      "Use AI proposals tailored to each business's specific pain point",
      "Manage your entire prospecting pipeline in the built-in CRM",
    ],
    features: [
      { icon: "🔍", title: "Multi-Channel Lead Discovery", desc: "Live business, remote job, community, and public web signals in one workflow." },
      { icon: "🤖", title: "AI Proposal Generation", desc: "One-click proposals personalised to each prospect's business and your agency's services." },
      { icon: "📋", title: "Team Pipeline", desc: "Track prospects across your team with a shared CRM pipeline." },
      { icon: "📬", title: "Outreach Campaigns", desc: "Prepare sequenced outreach and track follow-ups without losing context." },
    ],
    keywords: ["lead generation for marketing agencies", "agency prospecting tool", "find marketing clients"],
    cta: "Start Finding Agency Clients Free",
  },
  "freelance-copywriters": {
    name: "Freelance Copywriters",
    headline: "Find Copywriting Clients Who Are Actively Hiring — Right Now",
    sub: "iCloseLeads scans live hiring and project signals to surface companies actively looking for copywriters. No more cold pitching into the void.",
    pain: "Most copywriters get clients through referrals or platforms that take a 20% cut. iCloseLeads gives you direct access to companies posting for copywriters — no middleman.",
    useCases: [
      "Filter leads by 'copywriting', 'content writing', or 'SEO content' niche",
      "See real job and project posts from live hiring channels",
      "Write personalised proposals with AI in under 60 seconds",
      "Track every lead in your pipeline from first email to signed contract",
    ],
    features: [
      { icon: "⚡", title: "Live Jobs Feed", desc: "Real-time feed of copywriting opportunities updated frequently." },
      { icon: "✍️", title: "AI Proposals", desc: "Proposal writer trained on high-converting copywriter cold emails." },
      { icon: "📊", title: "Lead Scoring", desc: "Every lead is scored by AI so you focus on the highest-converting opportunities first." },
      { icon: "🔄", title: "Follow-Up Sequences", desc: "Automated 3-step follow-up sequences so no lead falls through the cracks." },
    ],
    keywords: ["find copywriting clients", "copywriter lead generation", "freelance copywriter jobs 2026"],
    cta: "Find Copywriting Clients Free",
  },
  "seo-consultants": {
    name: "SEO Consultants",
    headline: "Find Businesses That Need SEO Help Before Your Competitors Do",
    sub: "iCloseLeads combines local business discovery with live job board scanning to give SEO consultants a constant pipeline of warm prospects — businesses with weak web presence and companies actively hiring for SEO.",
    pain: "SEO is a high-ticket service but getting SEO clients is ironic — if you can't rank your own site yet, your best clients come from direct outreach. iCloseLeads is built for exactly that.",
    useCases: [
      "Find local businesses with no website or a Wix/Squarespace site ripe for SEO",
      "Search job boards for 'SEO manager', 'SEO specialist' posts from companies hiring",
      "Pitch both as a freelance consultant or as a managed service",
      "Use the AI proposal writer to create custom SEO audit pitches",
    ],
    features: [
      { icon: "📍", title: "Local Lead Discovery", desc: "Find businesses by city and type with website status flagged automatically." },
      { icon: "🔍", title: "Job Signal Scanner", desc: "Live hiring and project signals scanned for SEO opportunities." },
      { icon: "✍️", title: "Audit-Style Proposals", desc: "AI writes personalised SEO pitch emails referencing the prospect's specific situation." },
      { icon: "📊", title: "Pipeline Tracking", desc: "6-stage CRM designed for high-ticket service sales cycles." },
    ],
    keywords: ["find SEO clients", "SEO consultant lead generation", "how to get SEO clients 2026"],
    cta: "Find SEO Clients Free",
  },
  "wordpress-developers": {
    name: "WordPress Developers",
    headline: "Find WordPress Clients Actively Looking for Help — Not Just Job Listings",
    sub: "iCloseLeads surfaces businesses with outdated WordPress sites, companies posting for WordPress developers, and local businesses ready to build their first site — all in one platform.",
    pain: "WordPress development is one of the most competitive freelance niches. The freelancers winning are the ones doing direct outreach to businesses that visibly need help — not waiting on marketplaces.",
    useCases: [
      "Find local businesses with outdated sites (pre-2020 design, no SSL, slow load)",
      "Search live job boards filtered to 'WordPress', 'WooCommerce', 'Elementor'",
      "Pitch website rebuilds, speed optimisation, and maintenance retainers",
      "Manage 20+ prospects at once in the built-in CRM",
    ],
    features: [
      { icon: "🌐", title: "Website Status Detection", desc: "See which local businesses have no website, an outdated site, or a DIY builder site." },
      { icon: "⚡", title: "Live WordPress Jobs", desc: "Real-time feed filtered to WordPress, WooCommerce, and PHP opportunities." },
      { icon: "✍️", title: "Technical Proposals", desc: "AI writes developer-style pitches covering their specific tech stack and pain points." },
      { icon: "📋", title: "Client CRM", desc: "Track projects from first contact to ongoing maintenance retainer." },
    ],
    keywords: ["find WordPress clients", "WordPress developer lead generation", "get more WordPress projects 2026"],
    cta: "Find WordPress Clients Free",
  },
  "real-estate-brokers": {
    name: "Real Estate Brokers",
    headline: "Lead Closing Software Built for Real Estate Brokers",
    sub: "iCloseLeads helps real estate brokers find motivated sellers, buyers, and business owners in any market — with AI-powered outreach and a CRM designed for high-ticket closing.",
    pain: "Most real estate CRMs are bloated, expensive, and built for teams. iCloseLeads gives individual brokers and small teams a lean, AI-powered prospecting tool that actually generates leads.",
    useCases: [
      "Find local business owners by industry who may need commercial space",
      "Search for companies posting remote jobs (often expanding and needing office space)",
      "Use AI to write personalised outreach to cold prospects",
      "Track every deal from first conversation to close in a visual pipeline",
    ],
    features: [
      { icon: "📍", title: "Market-Specific Lead Search", desc: "Find leads by city, industry, and business size relevant to your market." },
      { icon: "🤖", title: "AI Outreach Writer", desc: "Personalised emails for every prospect type — sellers, buyers, commercial tenants." },
      { icon: "📊", title: "Deal Pipeline", desc: "Visualise your entire book of business with stage-by-stage deal tracking." },
      { icon: "🔔", title: "Follow-Up Automation", desc: "Never miss a follow-up with automated reminder sequences." },
    ],
    keywords: ["lead closing software real estate", "real estate broker lead generation tool", "CRM for real estate brokers"],
    cta: "Start Closing Real Estate Leads Free",
  },
  "shopify-developers": {
    name: "Shopify Developers",
    headline: "Find Shopify Clients Who Need Help — Before They Post on Upwork",
    sub: "iCloseLeads scans live hiring, community, and local business signals to surface ecommerce businesses that need Shopify development, theme work, or app integrations.",
    pain: "The best Shopify clients do not always post on marketplaces. They mention their problem in communities, publish hiring signals, or show obvious website gaps before they ask for proposals.",
    useCases: [
      "Search 'Shopify', 'ecommerce', 'WooCommerce to Shopify migration' across live lead channels",
      "Find local retailers with outdated or missing websites to pitch Shopify builds",
      "Write technical migration proposals with AI in 60 seconds",
      "Track every prospect from cold lead to retainer client",
    ],
    features: [
      { icon: "🛒", title: "Ecommerce Lead Filter", desc: "Filter leads specifically for Shopify, WooCommerce, and ecommerce development." },
      { icon: "📍", title: "Local Retailer Discovery", desc: "Find brick-and-mortar retailers in any city who don't yet sell online." },
      { icon: "✍️", title: "Technical Proposals", desc: "AI proposals that speak developer-to-merchant, not generic freelancer pitch." },
      { icon: "📊", title: "Client Pipeline", desc: "Manage discovery calls, proposals, and ongoing projects in one place." },
    ],
    keywords: ["find Shopify clients", "Shopify developer lead generation 2026", "get Shopify development work"],
    cta: "Find Shopify Clients Free",
  },
};

export function generateStaticParams() {
  return Object.keys(INDUSTRIES).map(industry => ({ industry }));
}

export async function generateMetadata({ params }: { params: { industry: string } }): Promise<Metadata> {
  const data = INDUSTRIES[params.industry];
  if (!data) return { title: "Not Found" };
  return {
    title: `iCloseLeads for ${data.name} — Find Clients & Leads in 2026`,
    description: data.sub,
    keywords: data.keywords,
    alternates: {
      canonical: `https://icloseleads.com/for/${params.industry}`,
    },
    openGraph: {
      title: `iCloseLeads for ${data.name}`,
      description: data.sub,
      url: `https://icloseleads.com/for/${params.industry}`,
    },
  };
}

export default function ForIndustryPage({ params }: { params: { industry: string } }) {
  const data = INDUSTRIES[params.industry];
  if (!data) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-[108px]">
        {/* Hero */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 pointer-events-none" />
          <div className="max-w-4xl mx-auto relative text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary-light border border-primary/20 mb-6">
              Built for {data.name}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
              {data.headline}
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              {data.sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth?mode=signup"
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-light transition-all shadow-glow-primary hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                <Zap className="w-5 h-5" />
                {data.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/blog"
                className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-medium w-full sm:w-auto justify-center">
                Read the guides
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Free during Early Access · No credit card · Cancel anytime</p>
          </div>
        </section>

        {/* Pain point */}
        <section className="py-16 px-4 bg-surface border-y border-border">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {data.pain}
            </p>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-foreground mb-12 text-center">
              How {data.name} Use iCloseLeads
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {data.useCases.map((uc, i) => (
                <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-card border border-border">
                  <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{uc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-surface border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-foreground mb-12 text-center">
              Everything You Need in One Place
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-gradient-card border border-border hover:border-primary/30 transition-colors">
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="text-foreground font-bold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-12 px-4 border-y border-border">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: <Zap className="w-5 h-5 text-primary-light" />, stat: "Multi", label: "Lead channels" },
              { icon: <MapPin className="w-5 h-5 text-accent" />, stat: "Local", label: "Business discovery" },
              { icon: <Target className="w-5 h-5 text-gold" />, stat: "AI", label: "Proposal drafting" },
              { icon: <TrendingUp className="w-5 h-5 text-primary-light" />, stat: "Free", label: "Early access" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                {s.icon}
                <div className="text-2xl font-extrabold text-foreground">{s.stat}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Target className="w-12 h-12 text-primary-light mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
              Ready to fill your pipeline?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Use iCloseLeads to build a steadier outreach pipeline without cold calling or expensive ad spend.
            </p>
            <Link href="/auth?mode=signup"
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary-light transition-all shadow-glow-primary hover:-translate-y-0.5">
              <Zap className="w-5 h-5" />
              {data.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-4">100% free during Early Access · No credit card needed</p>
          </div>
        </section>

        {/* Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "iCloseLeads",
          "applicationCategory": "BusinessApplication",
          "description": data.sub,
          "url": `https://icloseleads.com/for/${params.industry}`,
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "operatingSystem": "Web",
        }) }} />
      </main>
      <Footer />
    </>
  );
}
