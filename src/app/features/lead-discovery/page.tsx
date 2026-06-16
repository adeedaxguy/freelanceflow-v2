import type { Metadata } from "next";
import Link from "next/link";
import { Search, Zap, Globe, Target, Filter, RefreshCw, CheckCircle2, ArrowRight, Star, TrendingUp, Clock, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Freelance Lead Generation Software — Find Clients From 11 Live Sources | iCloseLeads",
  description: "Discover high-quality freelance leads from 11 real job boards simultaneously. AI-scored results, niche filters, and real-time search. Find your next $10k client in under 60 seconds.",
  keywords: [
    "freelance lead generation software",
    "find freelance clients online",
    "remote job aggregator for freelancers",
    "AI lead scoring freelancers",
    "automated freelance job search",
    "best way to find freelance clients",
    "freelance job board aggregator",
    "lead generation tool for freelancers 2025",
    "find remote work leads",
    "freelance client acquisition tool",
  ],
  openGraph: {
    title: "Freelance Lead Generation Software | iCloseLeads",
    description: "Search 11 live job boards in one click. AI scores every lead 0–100. Find your next client in 30 seconds.",
    url: "https://icloseleads.com/features/lead-discovery",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Find Freelance Clients with AI | iCloseLeads" },
  alternates: { canonical: "https://icloseleads.com/features/lead-discovery" },
};

const SOURCES = [
  { name: "Remote OK", color: "#00E5A0", leads: "200+" },
  { name: "Remotive", color: "#9F67FF", leads: "150+" },
  { name: "Reddit", color: "#FF6B6B", leads: "300+" },
  { name: "WeWorkRemotely", color: "#60A5FA", leads: "180+" },
  { name: "Arbeitnow", color: "#FFD166", leads: "120+" },
  { name: "Jobicy", color: "#F472B6", leads: "90+" },
  { name: "Working Nomads", color: "#34D399", leads: "100+" },
  { name: "GitHub Issues", color: "#A78BFA", leads: "80+" },
  { name: "HN Hiring", color: "#FB923C", leads: "60+" },
  { name: "Remote.co", color: "#38BDF8", leads: "110+" },
  { name: "Craigslist", color: "#E879F9", leads: "70+" },
];

const BENEFITS = [
  { icon: <Zap className="w-5 h-5 text-gold" />, title: "30-Second Search", desc: "All 11 sources fire in parallel. Full results in under 30 seconds — not 30 minutes of manual browsing." },
  { icon: <Target className="w-5 h-5 text-primary-light" />, title: "AI Quality Score 0–100", desc: "Every lead gets an AI relevance score based on recency, keywords, budget signals, and match to your niche." },
  { icon: <Filter className="w-5 h-5 text-accent" />, title: "Niche Targeting", desc: "15+ freelance niches — Web Dev, Design, SEO, Writing, AI/ML, Blockchain and more. Only see what's relevant to you." },
  { icon: <RefreshCw className="w-5 h-5 text-blue-400" />, title: "Always Fresh", desc: "Time-range filters from 12h to 7 days. Force Refresh bypasses cache for truly live results." },
  { icon: <Globe className="w-5 h-5 text-accent" />, title: "Smart Deduplication", desc: "The same job posted on 4 boards? You see it once — we merge and deduplicate across all sources automatically." },
  { icon: <Shield className="w-5 h-5 text-gold" />, title: "Real Leads Only", desc: "No synthetic data, no scraped contact lists. Every result is a real human or company actively posting a job right now." },
];

const FAQS = [
  { q: "How many freelance job boards does iCloseLeads search?", a: "iCloseLeads simultaneously searches 11 live freelance sources including Remote OK, Remotive, Reddit (/r/forhire, /r/hiring), WeWorkRemotely, Arbeitnow, Jobicy, Working Nomads, GitHub Issues, Hacker News Hiring, Remote.co, and Craigslist. New sources are added regularly." },
  { q: "How is the AI quality score calculated?", a: "Each lead is scored 0–100 based on relevance to your selected niche, recency of posting, presence of budget/rate signals, quality of the job description, and keyword match strength. Leads scoring 80+ are typically worth prioritising." },
  { q: "How often are results updated?", a: "Searches are cached for 30 minutes by default to ensure fast results. Use the Force Refresh button to bypass the cache and pull the absolute latest results from all 11 sources in real time." },
  { q: "Can I filter by niche, source, or time range?", a: "Yes. You can filter by 15+ niches (Web Development, Design, SEO, AI/ML, Blockchain, Writing, etc.), by specific source (e.g. only show Remote OK results), by time range (12h / 24h / 48h / 72h / 7 days), and sort by Freshest, Best Match, Best Quality, or Has Budget." },
  { q: "Does iCloseLeads work for non-developer freelancers?", a: "Absolutely. Niches include Brand Design, UI/UX, SEO, Copywriting, Video Editing, Social Media, Technical Writing, Virtual Assistant, Cybersecurity, Game Development and more. If you're a freelancer, there are relevant leads for your niche." },
];

export default function LeadDiscoveryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold mb-6">
            <Search className="w-4 h-4" /> Lead Discovery
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            Find Freelance Clients<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #9F67FF 0%, #00E5A0 100%)" }}>
              From 11 Live Sources at Once
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop manually browsing job boards. iCloseLeads searches 11 real platforms simultaneously, AI-scores every result, and surfaces your best leads in under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
              <Zap className="w-5 h-5" /> Start Finding Leads Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-medium transition-all">
              View All Features
            </Link>
          </div>
          <p className="text-muted-foreground text-sm mt-5">Free forever · No credit card · Live in 60 seconds</p>
        </div>
      </section>

      {/* Sources grid */}
      <section className="py-16 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground font-semibold uppercase tracking-widest mb-8">Pulling live leads from 11 sources</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SOURCES.map((s) => (
              <div key={s.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-foreground">{s.name}</span>
                <span className="text-muted-foreground text-xs">{s.leads}/day</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">The smarter way to find freelance clients</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Every feature is designed to save you time and surface only the leads worth pursuing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl bg-gradient-to-br from-surface to-background border border-border hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">{b.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-surface/40 border-y border-border/60">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "11", label: "Live job sources" },
            { n: "1,400+", label: "Fresh leads per day" },
            { n: "30s", label: "Average search time" },
            { n: "15+", label: "Freelance niches" },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="text-4xl font-extrabold bg-clip-text text-transparent mb-1" style={{ backgroundImage: "linear-gradient(135deg, #9F67FF, #00E5A0)" }}>{n}</div>
              <div className="text-muted-foreground text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">How lead discovery works</h2>
          <div className="space-y-8">
            {[
              { n: "1", title: "Select your niche", desc: "Choose from 15+ freelance niches — or search multiple at once. iCloseLeads knows the right keywords to match across all job boards." },
              { n: "2", title: "Set your time range", desc: "Filter from 12 hours to 7 days fresh. The tighter the window, the hotter the lead. For brand new opportunities, use 12h." },
              { n: "3", title: "Get AI-scored results", desc: "Results come back in seconds, sorted by AI quality score. Green = top leads. Every card shows source, budget signals, and match strength." },
              { n: "4", title: "Save, apply, or generate a proposal", desc: "One click to save a lead to your CRM. One more click to generate an AI-written cold email proposal tailored to that specific job posting." },
            ].map((step) => (
              <div key={step.n} className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">{step.n}</div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-surface/40 border-t border-border/60">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <TrendingUp className="w-12 h-12 text-primary-light mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Start finding leads in 60 seconds</h2>
          <p className="text-muted-foreground text-lg mb-8">Free forever. No credit card. Your first search returns real results instantly.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
            <Zap className="w-5 h-5" /> Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            {["No credit card", "11 live sources", "AI-scored results"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "AI Proposal Generator", href: "/features/ai-proposals" },
              { label: "CRM Pipeline", href: "/features/crm-pipeline" },
              { label: "Email Outreach", href: "/features/email-outreach" },
              { label: "Analytics Dashboard", href: "/features/analytics" },
              { label: "Free Tools", href: "/features/free-tools" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
