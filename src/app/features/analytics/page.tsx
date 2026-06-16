import type { Metadata } from "next";
import Link from "next/link";
import { BarChart2, Zap, TrendingUp, PieChart, Target, CheckCircle2, ArrowRight, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Freelance Analytics Dashboard — Track Leads, Proposals & Revenue | iCloseLeads",
  description: "See exactly what's working in your freelance business. Track open rates, reply rates, win rates, pipeline conversion, and revenue — all in one dashboard.",
  keywords: [
    "freelance analytics dashboard",
    "track freelance outreach performance",
    "freelance business analytics tool",
    "proposal conversion tracking freelancers",
    "freelance revenue tracking",
    "cold email analytics freelancers",
    "freelance KPI dashboard",
    "best analytics tool for freelancers 2025",
    "track leads and proposals freelance",
    "freelance pipeline conversion rate",
  ],
  openGraph: {
    title: "Freelance Analytics Dashboard | iCloseLeads",
    description: "Open rates, reply rates, win rates, revenue — all tracked automatically. Know what's working and double down.",
    url: "https://icloseleads.com/features/analytics",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Freelance Analytics Dashboard | iCloseLeads" },
  alternates: { canonical: "https://icloseleads.com/features/analytics" },
};

const METRICS = [
  { name: "Email open rate", value: "94%", sub: "vs 21% industry avg", color: "#00E5A0" },
  { name: "Average reply rate", value: "14%", sub: "for well-targeted leads", color: "#9F67FF" },
  { name: "Pipeline win rate", value: "22%", sub: "across all user accounts", color: "#FFD166" },
  { name: "Avg time to first reply", value: "47min", sub: "from first send", color: "#60A5FA" },
];

const BENEFITS = [
  { icon: <Activity className="w-5 h-5 text-accent" />, title: "Real-Time Dashboard", desc: "Leads found, proposals sent, emails opened, replies received — all updating live as you work. No manual reporting." },
  { icon: <PieChart className="w-5 h-5 text-primary-light" />, title: "Source Breakdown", desc: "See which of the 11 job sources actually converts for your niche. Double down on what works, deprioritise what doesn't." },
  { icon: <TrendingUp className="w-5 h-5 text-gold" />, title: "30-Day Email Trends", desc: "Line chart of opens, clicks, and replies over the past 30 days. Spot patterns: best send days, seasonal dips, campaign performance." },
  { icon: <Target className="w-5 h-5 text-blue-400" />, title: "Pipeline Reports", desc: "Win rate, average time-to-close, deals by stage, and revenue won per month — calculated automatically from your CRM data." },
  { icon: <BarChart2 className="w-5 h-5 text-purple-400" />, title: "Niche Performance", desc: "Which niche gets you the most replies? Web dev? Design? SEO? The niche breakdown shows you where to focus your energy." },
  { icon: <CheckCircle2 className="w-5 h-5 text-accent" />, title: "Weekly Usage Stats", desc: "Track your free plan quota: leads searched, proposals generated, emails sent. Always know exactly where you stand." },
];

const FAQS = [
  { q: "What analytics does the free plan include?", a: "The free plan includes the main dashboard overview (leads found, proposals sent, emails opened, replies), weekly usage stats, and basic pipeline counts. The full source breakdown chart, 30-day trend graphs, and niche performance breakdown are on Pro." },
  { q: "How is the email open rate calculated?", a: "iCloseLeads tracks email opens using a 1×1 pixel tracking image embedded in each sent email. When the recipient opens the email, the pixel fires and the open is logged against that lead in your sent history." },
  { q: "Can I see which job sources give me the best results?", a: "Yes. The Source Breakdown section shows the count of leads from each source, and when cross-referenced with your sent and replied emails, you can see which sources produce the best-converting leads for your niche." },
  { q: "Is the revenue tracking automatic?", a: "Revenue is tracked when you move a lead to 'Won' in the pipeline and optionally enter a deal value. Monthly revenue won is then shown on the analytics dashboard. Future versions will support recurring/retainer revenue tracking." },
  { q: "Can I export analytics data?", a: "Yes. Export your full sent email log as CSV. For pipeline analytics, the full pipeline export includes status, source, date contacted, and notes. Raw analytics CSV export is on our Pro roadmap." },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-transparent to-purple-500/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">
            <BarChart2 className="w-4 h-4" /> Analytics
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            Know Exactly What&apos;s Working<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #34D399 0%, #9F67FF 100%)" }}>
              In Your Freelance Business
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. iCloseLeads tracks every open, click, reply, and deal close — then shows you exactly where your time is best spent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
              <Zap className="w-5 h-5" /> View Your Dashboard Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-medium transition-all">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {METRICS.map(({ name, value, sub, color }) => (
            <div key={name} className="text-center p-5 rounded-2xl border border-border bg-background">
              <div className="text-3xl font-extrabold mb-1" style={{ color }}>{value}</div>
              <div className="text-foreground text-sm font-semibold mb-0.5">{name}</div>
              <div className="text-muted-foreground text-xs">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Every metric that matters for freelance growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-green-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">{b.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-surface/40 border-y border-border/60">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Data-driven freelancing starts here</h2>
          <p className="text-muted-foreground text-lg mb-8">Free dashboard included on every plan. No setup, no integrations — just sign up and your data starts tracking immediately.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
            <Zap className="w-5 h-5" /> Open Your Dashboard Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Lead Discovery", href: "/features/lead-discovery" },
              { label: "AI Proposals", href: "/features/ai-proposals" },
              { label: "CRM Pipeline", href: "/features/crm-pipeline" },
              { label: "Email Outreach", href: "/features/email-outreach" },
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
