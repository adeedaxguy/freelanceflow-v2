import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, Clock, MessageSquare, Edit3, CheckCircle2, ArrowRight, TrendingUp, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "AI Proposal Generator for Freelancers — Write Winning Cold Emails in 3 Seconds | iCloseLeads",
  description: "Generate personalized freelance proposals and cold emails in 3 seconds using Groq's Llama 3.3 AI. Tailored to each job posting. Used by 2,800+ freelancers to land clients faster.",
  keywords: [
    "AI proposal generator for freelancers",
    "automated proposal writing freelance",
    "cold email generator freelancers",
    "AI cover letter freelance jobs",
    "personalized proposal writing AI",
    "freelance pitch generator",
    "how to write freelance proposals faster",
    "best AI tool for freelance proposals",
    "automated cold email outreach freelancers",
    "freelance proposal template generator",
  ],
  openGraph: {
    title: "AI Proposal Generator for Freelancers | iCloseLeads",
    description: "Stop staring at blank screens. iCloseLeads writes a personalized cold email for every lead in 3 seconds.",
    url: "https://icloseleads.com/features/ai-proposals",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "AI Proposal Generator for Freelancers | iCloseLeads" },
  alternates: { canonical: "https://icloseleads.com/features/ai-proposals" },
};

const BENEFITS = [
  { icon: <Clock className="w-5 h-5 text-gold" />, title: "3-Second Generation", desc: "Powered by Groq's ultra-fast inference. Click generate — your personalised proposal is ready before you finish blinking." },
  { icon: <MessageSquare className="w-5 h-5 text-primary-light" />, title: "Reads the Actual Job Posting", desc: "The AI parses the real job description — company name, tech stack, requirements — and weaves it into the email. Not a template. Not generic." },
  { icon: <Edit3 className="w-5 h-5 text-accent" />, title: "Sounds Like You, Not ChatGPT", desc: "Groq's Llama 3.3 writes in a natural, conversational tone that passes the 'did a human write this?' test every time. No robotic phrasing." },
  { icon: <Star className="w-5 h-5 text-gold" />, title: "Niche-Aware", desc: "The AI knows whether you're a React developer, SEO consultant, or brand designer and adjusts vocabulary, tone, and credibility signals accordingly." },
  { icon: <Sparkles className="w-5 h-5 text-primary-light" />, title: "Follow-Up Sequences", desc: "Generate follow-up emails after your initial proposal. Perfectly timed, warm, non-pushy — the emails people actually reply to." },
  { icon: <CheckCircle2 className="w-5 h-5 text-accent" />, title: "Edit Before Sending", desc: "Every proposal is fully editable before you send. Add your portfolio link, tweak the opening line, or adjust the rate — full control." },
];

const FAQS = [
  { q: "What AI model powers the proposal generator?", a: "iCloseLeads uses Groq's llama-3.3-70b-versatile — one of the fastest and most capable large language models available. Groq's inference speed means proposals generate in under 3 seconds without sacrificing quality." },
  { q: "Are the proposals actually personalised, or just templates?", a: "Genuinely personalised. The AI reads the specific job posting you clicked on — including the company name, requirements, and job description — and writes a cold email that references those details. Two different job postings produce two completely different emails." },
  { q: "Can I save my own proposal templates?", a: "Yes. Save any proposal you've edited as a personal template. On your next search, choose your template as a starting point and the AI will adapt it to each new lead automatically." },
  { q: "How does the follow-up writer work?", a: "After sending your initial proposal, navigate to that lead in your CRM and click Generate Follow-Up. The AI writes a warm, non-pushy follow-up that acknowledges your original email and adds a new angle or value proposition." },
  { q: "What's the typical response rate with AI-generated proposals?", a: "Users report 3–5× higher response rates compared to generic templates. The 94% open rate on our proposals comes from AI-optimised subject lines. Actual reply rates vary by niche and targeting quality, but 10–20% is common for well-targeted leads." },
  { q: "Does the AI work for non-English proposals?", a: "The AI can generate proposals in multiple languages. If the job posting is in French, German, Spanish, or Portuguese, tell it the language and it will respond accordingly." },
];

export default function AIProposalsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-primary/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> AI Proposal Engine
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            Write Winning Freelance Proposals<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #FFD166 0%, #9F67FF 100%)" }}>
              in 3 Seconds with AI
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop spending 20 minutes on every proposal. iCloseLeads reads the job posting and writes a personalised cold email that sounds like you — in under 3 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
              <Zap className="w-5 h-5" /> Generate Your First Proposal Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-medium transition-all">
              View All Features
            </Link>
          </div>
          <p className="text-muted-foreground text-sm mt-5">Free forever · No credit card · 5 free proposals/week on free plan</p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="py-8 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { n: "94%", label: "Open rate on AI proposals" },
            { n: "3s", label: "Average generation time" },
            { n: "3–5×", label: "Higher reply rate vs templates" },
            { n: "2,800+", label: "Freelancers using iCloseLeads" },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-gold mb-0.5">{n}</div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Example proposal */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">What a generated proposal looks like</h2>
            <p className="text-muted-foreground">This is a real output from our AI — generated in 2.3 seconds for a React developer job posting.</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-surface p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">AI</div>
              <div>
                <p className="text-foreground font-semibold text-sm">Generated proposal for: Senior React Developer — Acme Corp</p>
                <p className="text-muted-foreground text-xs">Generated in 2.3 seconds · Groq llama-3.3-70b</p>
              </div>
              <span className="ml-auto px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold border border-accent/20">Score: 94</span>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Subject:</strong> React dev — I noticed your stack and have shipped this exact thing</p>
              <hr className="border-border" />
              <p>Hi — I saw Acme Corp is hiring a Senior React developer and your stack caught my eye: Next.js 14, TypeScript, and a real-time dashboard requirement.</p>
              <p>I've built production Next.js apps for 12+ SaaS companies over the past 3 years — most recently a real-time analytics dashboard for a FinTech startup (40k DAU). The performance optimisation work alone cut their LCP from 4.2s to 0.8s.</p>
              <p>A few things that stood out from your post: you mentioned "clean component architecture" — I write fully typed, test-covered components and keep PRs under 400 lines. I'd fit right into your existing team workflow.</p>
              <p>Available immediately for a 30-min intro call. Are you free this week?</p>
              <p className="text-foreground font-medium">— [Your Name]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-24 px-4 bg-surface/40 border-y border-border/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Everything your proposal needs to convert</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 rounded-2xl bg-background border border-border hover:border-gold/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">{b.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
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
      <section className="py-24 px-4 border-t border-border/60">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Your next proposal is 3 seconds away</h2>
          <p className="text-muted-foreground text-lg mb-8">Generate 5 free proposals per week on our free plan. Unlimited on Pro.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
            <Zap className="w-5 h-5" /> Try the AI Proposal Generator <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Lead Discovery", href: "/features/lead-discovery" },
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
