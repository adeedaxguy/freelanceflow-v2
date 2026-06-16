import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, Zap, DollarSign, Mail, AlertTriangle, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Free Freelance Tools — Rate Calculator, Subject Line Generator & More | iCloseLeads",
  description: "Free tools built for freelancers: hourly rate calculator, cold email subject line generator, and red flag detector. No signup required for basic use.",
  keywords: [
    "free freelance tools",
    "freelance rate calculator",
    "cold email subject line generator freelance",
    "freelance red flag detector",
    "how to calculate freelance hourly rate",
    "free tools for freelancers 2025",
    "freelance pricing calculator",
    "best subject lines for cold emails freelancers",
    "spot bad clients freelance",
    "free resources for freelancers",
  ],
  openGraph: {
    title: "Free Freelance Tools | iCloseLeads",
    description: "Rate calculator, subject line generator, red flag detector — 3 free tools every freelancer needs.",
    url: "https://icloseleads.com/features/free-tools",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Free Tools for Freelancers | iCloseLeads" },
  alternates: { canonical: "https://icloseleads.com/features/free-tools" },
};

const TOOLS = [
  {
    icon: <DollarSign className="w-6 h-6 text-accent" />,
    color: "#00E5A0",
    name: "Freelance Rate Calculator",
    desc: "Stop undercharging. Enter your target annual income, expenses, billable hours, and desired profit margin — the calculator tells you exactly what to charge per hour or per project.",
    features: ["Hourly rate calculation", "Project rate estimation", "Tax & expense adjustment", "Market rate comparison"],
    keyword: "freelance rate calculator",
  },
  {
    icon: <Mail className="w-6 h-6 text-gold" />,
    color: "#FFD166",
    name: "Subject Line Generator",
    desc: "The subject line determines whether your cold email gets opened or deleted. This tool generates 5 high-converting subject line variants for your specific niche and job type.",
    features: ["5 variants per request", "Niche-aware suggestions", "Open-rate optimised", "A/B testing guidance"],
    keyword: "email subject line generator freelancers",
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
    color: "#EF4444",
    name: "Red Flag Detector",
    desc: "Paste a job description and our AI scans it for the classic signs of bad clients — unrealistic budgets, scope creep signals, payment risk indicators, and exploitation patterns.",
    features: ["Budget red flag detection", "Scope creep signals", "Payment risk assessment", "Exploitation pattern matching"],
    keyword: "freelance red flag detector",
  },
];

const FAQS = [
  { q: "Are the tools really free?", a: "Yes — all three tools are free to use without any account required for basic use. Signed-in users get unlimited usage and saved results history." },
  { q: "How does the rate calculator work?", a: "Enter your desired annual income, estimated annual expenses (software, equipment, taxes), the number of billable hours you can realistically work per year, and your target profit margin. The calculator outputs your minimum viable hourly rate and recommended project rates for common project types in your niche." },
  { q: "How accurate is the red flag detector?", a: "The red flag detector uses pattern matching and AI analysis trained on thousands of real freelance job postings. It flags common warning signs with high accuracy, but it's a tool to assist your judgment — not replace it. Always read the full posting yourself." },
  { q: "Can I save the output from these tools?", a: "Signed-in users can save rate calculations and subject line sets to their account for future reference. Red flag scan results are saved alongside the lead if accessed directly from the lead discovery search." },
];

export default function FreeToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-gold/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
            <Wrench className="w-4 h-4" /> Free Tools
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            3 Free Tools Every<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #00E5A0 0%, #FFD166 100%)" }}>
              Freelancer Actually Needs
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Rate calculator, subject line generator, and red flag detector — built into iCloseLeads and free for everyone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
              <Zap className="w-5 h-5" /> Access All Tools Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="px-6 py-4 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 text-sm font-medium transition-all">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {TOOLS.map((tool, i) => (
            <div key={tool.name} className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 p-8 rounded-3xl border border-border bg-surface hover:border-opacity-60 transition-all`}
              style={{ borderColor: `${tool.color}25` }}>
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${tool.color}15` }}>
                  {tool.icon}
                </div>
                <h2 className="text-2xl font-extrabold text-foreground mb-3">{tool.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{tool.desc}</p>
                <ul className="space-y-2">
                  {tool.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: tool.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-sm p-6 rounded-2xl border bg-background" style={{ borderColor: `${tool.color}30` }}>
                  <div className="w-full h-32 rounded-xl flex items-center justify-center" style={{ background: `${tool.color}08` }}>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${tool.color}20` }}>
                        {tool.icon}
                      </div>
                      <p className="text-muted-foreground text-sm">Try it free →</p>
                    </div>
                  </div>
                  <Link href="/auth?mode=signup" className="mt-4 block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: `${tool.color}15`, color: tool.color, border: `1px solid ${tool.color}30` }}>
                    Open {tool.name.split(" ")[0]} {tool.name.split(" ")[1]} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
          <Wrench className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Tools that pay for themselves</h2>
          <p className="text-muted-foreground text-lg mb-8">One rate calculation that stops you undercharging. One red flag caught before signing a bad contract. Completely free.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg">
            <Zap className="w-5 h-5" /> Access All Free Tools <ArrowRight className="w-4 h-4" />
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
              { label: "Analytics", href: "/features/analytics" },
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
