import type { Metadata } from "next";
import Link from "next/link";
import { Search, Zap, Globe, Target, Filter, RefreshCw, CheckCircle2, ArrowRight, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Freelance Lead Generation Software — Find Clients From 16 Live Sources | iCloseLeads",
  description: "Discover high-quality freelance leads from 16 real job boards simultaneously. AI-scored 0–100, niche filters, real-time. Find your next $10k client in 30 seconds.",
  keywords: ["freelance lead generation software","find freelance clients online","remote job aggregator for freelancers","AI lead scoring freelancers","automated freelance job search","best way to find freelance clients","freelance job board aggregator","lead generation tool for freelancers 2025","find remote work leads","freelance client acquisition tool"],
  openGraph: { title: "Freelance Lead Generation Software | iCloseLeads", description: "Search 16 live job boards in one click. AI scores every lead 0–100.", url: "https://icloseleads.com/features/lead-discovery", type: "website" },
  alternates: { canonical: "https://icloseleads.com/features/lead-discovery" },
};

const SOURCES = ["Remote OK","Remotive","Reddit","WeWorkRemotely","Arbeitnow","Jobicy","Working Nomads","Hacker News","YC Jobs","Authentic Jobs","GitHub Bounties","Smashing Jobs","Dribbble Jobs","Jobspresso","Himalayas","No Desk"];
const BENEFITS = [
  { icon: <Zap className="w-5 h-5 text-gold" />, title: "30-Second Search", desc: "All 16 sources fire in parallel. Full scored results in under 30 seconds." },
  { icon: <Target className="w-5 h-5 text-primary-light" />, title: "AI Quality Score 0–100", desc: "Every lead gets a relevance score based on recency, keywords, budget signals, and niche match." },
  { icon: <Filter className="w-5 h-5 text-accent" />, title: "15+ Niche Filters", desc: "Web Dev, Design, SEO, Writing, AI/ML, Blockchain and more. Only see what matters to you." },
  { icon: <RefreshCw className="w-5 h-5 text-blue-400" />, title: "Always Fresh", desc: "Filter from 12h to 7 days. Force Refresh bypasses cache for truly live results." },
  { icon: <Globe className="w-5 h-5 text-accent" />, title: "Smart Deduplication", desc: "Same job on 4 boards? You see it once — merged and deduplicated automatically." },
];
const FAQS = [
  { q: "How many job boards does iCloseLeads search?", a: "16 live sources simultaneously: Remote OK, Remotive, Reddit, WeWorkRemotely, Arbeitnow, Jobicy, Working Nomads, Hacker News, YC Jobs, Authentic Jobs, GitHub Bounties, Smashing Jobs, Dribbble Jobs, Jobspresso, Himalayas, and No Desk." },
  { q: "How is the AI quality score calculated?", a: "Each lead is scored 0–100 based on relevance to your niche, recency, budget/rate signals, description quality, and keyword match strength." },
  { q: "Can I filter by source, niche, or time range?", a: "Yes — filter by 15+ niches, specific source, time range (12h/24h/48h/72h/7d), and sort by Freshest, Best Match, Best Quality, or Has Budget." },
];

export default function LeadDiscoveryPage() {
  const CURRENT = "lead-discovery";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold mb-6"><Search className="w-4 h-4" /> Lead Discovery</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">Find Freelance Clients<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#9F67FF 0%,#00E5A0 100%)" }}>From 16 Live Sources at Once</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Stop manually browsing job boards. iCloseLeads searches 16 real platforms simultaneously, AI-scores every result, and surfaces your best leads in under 30 seconds.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg"><Zap className="w-5 h-5" /> Start Finding Leads Free <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all">View All Features</Link>
          </div>
          <p className="text-muted-foreground text-sm mt-5">Free forever · No credit card · Live in 60 seconds</p>
        </div>
      </section>
      <section className="py-12 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-6">Pulling live leads from 16 sources</p>
          <div className="flex flex-wrap justify-center gap-2">{SOURCES.map(s => <span key={s} className="px-3 py-1.5 rounded-full bg-surface border border-border text-sm text-muted-foreground">{s}</span>)}</div>
        </div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">The smarter way to find freelance clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => <div key={b.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">{b.icon}</div><h3 className="font-bold text-foreground mb-2">{b.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p></div>)}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 bg-surface/40 border-y border-border/60">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{n:"16",l:"Live sources"},{n:"1,400+",l:"Fresh leads/day"},{n:"30s",l:"Avg search time"},{n:"15+",l:"Niches"}].map(({n,l})=><div key={l}><div className="text-4xl font-extrabold bg-clip-text text-transparent mb-1" style={{backgroundImage:"linear-gradient(135deg,#9F67FF,#00E5A0)"}}>{n}</div><div className="text-muted-foreground text-sm">{l}</div></div>)}
        </div>
      </section>
      <section className="py-24 px-4 bg-surface/40 border-t border-border/60">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-5">{FAQS.map(({q,a})=><div key={q} className="border border-border rounded-2xl p-6"><h3 className="font-bold text-foreground mb-2">{q}</h3><p className="text-muted-foreground text-sm leading-relaxed">{a}</p></div>)}</div>
        </div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <TrendingUp className="w-12 h-12 text-primary-light mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Start finding leads in 60 seconds</h2>
          <p className="text-muted-foreground text-lg mb-8">Free forever. Real results on your first search.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Get Started Free <ArrowRight className="w-4 h-4" /></Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">{["No credit card","16 live sources","AI-scored"].map(t=><span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" />{t}</span>)}</div>
        </div>
      </section>
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[{label:"AI Proposals",href:"/features/ai-proposals"},{label:"CRM Pipeline",href:"/features/crm-pipeline"},{label:"Email Outreach",href:"/features/email-outreach"},{label:"Analytics",href:"/features/analytics"},{label:"Free Tools",href:"/features/free-tools"}].map(({label,href})=><Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">{label} →</Link>)}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
