import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Zap, CheckCircle2, ArrowRight, TrendingUp, Bell, FileDown, StickyNote, BarChart2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Freelance CRM Software — Track Every Client Deal in a 6-Stage Pipeline | iCloseLeads",
  description: "The built-in CRM for freelancers. Move leads through 6 stages from New to Won. Never lose track of a deal again. Free forever, no spreadsheets needed.",
  keywords: [
    "freelance CRM software",
    "client pipeline management for freelancers",
    "best CRM for freelancers",
    "freelance deal tracker",
    "freelance project pipeline tool",
    "track freelance leads and clients",
    "simple CRM for freelancers 2025",
    "freelance sales pipeline",
    "client management software freelancer",
    "free CRM for independent contractors",
  ],
  openGraph: {
    title: "Freelance CRM & Pipeline Management | iCloseLeads",
    description: "6-stage pipeline built for freelancers. New → Contacted → Replied → Follow-Up → Won → Lost. Never drop a deal.",
    url: "https://icloseleads.com/features/crm-pipeline",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Freelance CRM Software | iCloseLeads" },
  alternates: { canonical: "https://icloseleads.com/features/crm-pipeline" },
};

const STAGES = [
  { name: "New", color: "#60A5FA", desc: "Leads you've saved but haven't contacted yet." },
  { name: "Contacted", color: "#9F67FF", desc: "You've sent a proposal or reached out." },
  { name: "Replied", color: "#FFD166", desc: "They responded — conversation is active." },
  { name: "Follow-Up", color: "#FB923C", desc: "Needs a nudge — follow-up email queued." },
  { name: "Won", color: "#00E5A0", desc: "Deal closed. Revenue added to your stats." },
  { name: "Lost", color: "#EF4444", desc: "Didn't convert. Archived for reference." },
];

const BENEFITS = [
  { icon: <Layers className="w-5 h-5 text-primary-light" />, title: "6-Stage Visual Pipeline", desc: "See every deal at a glance. Move leads between stages with one click. Your entire client pipeline on one screen." },
  { icon: <Bell className="w-5 h-5 text-gold" />, title: "Follow-Up Reminders", desc: "iCloseLeads tells you when to follow up based on how long a lead has been in each stage. Never go silent at the wrong moment." },
  { icon: <StickyNote className="w-5 h-5 text-accent" />, title: "Private Lead Notes", desc: "Add private notes to any lead — context about the company, the contact, or what was discussed. Available wherever you are." },
  { icon: <FileDown className="w-5 h-5 text-blue-400" />, title: "CSV Export", desc: "Export your full pipeline to a CSV file at any time. All fields: company, contact, status, notes, date, source. Excel-ready with UTF-8 BOM." },
  { icon: <BarChart2 className="w-5 h-5 text-purple-400" />, title: "Pipeline Analytics", desc: "See your win rate, average time-to-close, best sources, and monthly revenue won — all calculated automatically from your CRM data." },
  { icon: <TrendingUp className="w-5 h-5 text-pink-400" />, title: "Source Tracking", desc: "Each lead remembers where it came from — Remote OK, Reddit, Arbeitnow, etc. Know which sources actually convert for your niche." },
];

const FAQS = [
  { q: "Do I need to pay for the CRM features?", a: "No. The full 6-stage pipeline, lead notes, status tracking, and follow-up reminders are free on all plans — including the free tier. CSV export is included on Pro and above." },
  { q: "How many leads can I track in the pipeline?", a: "The free plan supports unlimited pipeline entries — there's no cap on how many leads you can track. Weekly limits apply only to new lead searches, not saved/pipeline leads." },
  { q: "Can I move leads between stages from mobile?", a: "Yes. iCloseLeads is fully mobile-responsive with a native-style bottom navigation bar. The pipeline is fully functional on mobile — tap to move leads between stages." },
  { q: "Does iCloseLeads integrate with other CRMs like HubSpot or Notion?", a: "Not yet directly, but you can export your full pipeline as a CSV and import it into any CRM. Native integrations with HubSpot and Notion are on our roadmap for the Pro plan." },
  { q: "What happens to Won deals — can I track revenue?", a: "Yes. When you move a lead to Won, you can optionally log the deal value. iCloseLeads tracks cumulative revenue won per month and shows it on your analytics dashboard." },
];

export default function CRMPipelinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-primary/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
            <Layers className="w-4 h-4" /> CRM Pipeline
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            The Freelance CRM That<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #60A5FA 0%, #9F67FF 100%)" }}>
              Closes Deals, Not Spreadsheets
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A built-in 6-stage pipeline designed for freelancers. Track every lead from first contact to closed deal — with reminders, notes, and analytics included.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
              <Zap className="w-5 h-5" /> Start Tracking Leads Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-medium transition-all">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline stages */}
      <section className="py-16 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground font-semibold uppercase tracking-widest mb-8">Your 6-stage pipeline</p>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            {STAGES.map((s, i) => (
              <div key={s.name} className="flex-1 flex flex-col items-center p-4 rounded-xl border border-border bg-background text-center">
                <div className="w-3 h-3 rounded-full mb-3" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
                <p className="font-bold text-foreground text-sm mb-1">{s.name}</p>
                <p className="text-muted-foreground text-xs leading-snug">{s.desc}</p>
                {i < STAGES.length - 1 && (
                  <div className="hidden sm:block absolute text-muted-foreground/30 text-xl" style={{ right: -12, top: "50%", transform: "translateY(-50%)" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Everything a freelancer needs to close more deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">{b.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Layers className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Stop losing deals in a spreadsheet</h2>
          <p className="text-muted-foreground text-lg mb-8">iCloseLeads CRM is free forever. No imports, no setup — your pipeline is ready the moment you save your first lead.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
            <Zap className="w-5 h-5" /> Open Your Free Pipeline <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            {["No credit card", "6-stage pipeline", "Unlimited leads"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Lead Discovery", href: "/features/lead-discovery" },
              { label: "AI Proposals", href: "/features/ai-proposals" },
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
