import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Zap, Send, BarChart2, Shield, CheckCircle2, ArrowRight, TrendingUp, Clock, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Cold Email Outreach for Freelancers — Send, Track & Follow Up | iCloseLeads",
  description: "Send personalised cold emails directly from iCloseLeads. Track opens, clicks, and replies. Built-in campaign builder and follow-up sequences for freelancers.",
  keywords: [
    "cold email outreach for freelancers",
    "freelance email campaign tool",
    "automated cold email freelancers",
    "email tracking for freelancers",
    "freelance outreach software",
    "cold email software for independent contractors",
    "how to do cold outreach as a freelancer",
    "email campaign builder freelancers",
    "best cold email tool freelancers 2025",
    "send cold emails from your own account",
  ],
  openGraph: {
    title: "Cold Email Outreach for Freelancers | iCloseLeads",
    description: "Write, send, and track cold emails without leaving iCloseLeads. See opens, clicks, and replies in real time.",
    url: "https://icloseleads.com/features/email-outreach",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Cold Email Outreach Tool for Freelancers | iCloseLeads" },
  alternates: { canonical: "https://icloseleads.com/features/email-outreach" },
};

const BENEFITS = [
  { icon: <Send className="w-5 h-5 text-pink-400" />, title: "One-Click Send", desc: "Write or generate your proposal, review it, and send — all from the same screen. No copying, no switching tabs, no forgetting to follow up." },
  { icon: <Eye className="w-5 h-5 text-primary-light" />, title: "Open & Click Tracking", desc: "See exactly who opened your email and when. Prioritise follow-ups based on real engagement signals — not guesswork." },
  { icon: <Clock className="w-5 h-5 text-gold" />, title: "Campaign Builder", desc: "Set up multi-step outreach sequences. Initial email → 3-day follow-up → 7-day nudge. All automated, all personalised." },
  { icon: <Shield className="w-5 h-5 text-accent" />, title: "Gmail OAuth Integration", desc: "Connect your Gmail account and send from your real email address — not a third-party domain. Better deliverability, more trust." },
  { icon: <BarChart2 className="w-5 h-5 text-blue-400" />, title: "Sent History Log", desc: "Every email you send is logged with timestamp, status, and full body. Never wonder if you already reached out to someone." },
  { icon: <CheckCircle2 className="w-5 h-5 text-accent" />, title: "Duplicate Prevention", desc: "iCloseLeads automatically prevents you from emailing the same company twice. Protect your reputation and stay professional." },
];

const FAQS = [
  { q: "Does iCloseLeads send emails from my own email address?", a: "Yes. Connect your Gmail account via OAuth and iCloseLeads sends from your real Gmail address — not a shared sender domain. This dramatically improves deliverability and open rates because recipients see a real person's name." },
  { q: "Can I send cold emails to any lead I find?", a: "You can email any lead that has a visible contact email on the job posting. For leads without emails, iCloseLeads shows a 'Find Phone' link and a Google Maps search to find contact details externally." },
  { q: "How does the campaign builder work?", a: "Create a campaign with an initial email and up to 4 follow-up steps. Set a delay between each step (e.g. 3 days, 7 days). iCloseLeads schedules each email automatically and stops the sequence when a reply is detected." },
  { q: "What's the open rate on emails sent through iCloseLeads?", a: "Users report an average 94% open rate — significantly above the industry average of 21% for cold email. The combination of personalised AI subject lines, real Gmail sending, and targeted leads accounts for this." },
  { q: "Is there a limit on how many emails I can send?", a: "On the free plan, email sending limits align with Gmail's own sending limits (500/day for standard Gmail). iCloseLeads doesn't impose additional limits. Pro users additionally get campaign sequences and bulk send scheduling." },
];

export default function EmailOutreachPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/8 via-transparent to-blue-500/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-semibold mb-6">
            <Mail className="w-4 h-4" /> Email Outreach
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            Cold Email Outreach Built<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #F472B6 0%, #60A5FA 100%)" }}>
              for Freelancers Who Close
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Write, send, and track cold emails without leaving iCloseLeads. Connected to your Gmail. Tracked in real time. No separate tool needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
              <Zap className="w-5 h-5" /> Start Sending Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-medium transition-all">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { n: "94%", label: "Average open rate" },
            { n: "1-click", label: "Send from your search results" },
            { n: "Gmail", label: "Send from your real address" },
            { n: "0 duplicates", label: "Automatic send deduplication" },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="text-2xl font-extrabold text-pink-400 mb-0.5">{n}</div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Everything you need for effective cold outreach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-pink-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">{b.icon}</div>
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
          <Mail className="w-12 h-12 text-pink-400 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Send your first cold email in 60 seconds</h2>
          <p className="text-muted-foreground text-lg mb-8">Find a lead, generate an AI proposal, connect Gmail, send. Free forever.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
            <Zap className="w-5 h-5" /> Get Started Free <ArrowRight className="w-4 h-4" />
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
