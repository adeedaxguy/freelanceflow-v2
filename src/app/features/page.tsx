import type { Metadata } from "next";
import Link from "next/link";
import { Target, Search, Sparkles, Mail, BarChart2, FileText, Check, X, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "iCloseLeads Features — AI-Powered Client Acquisition for Freelancers",
  description: "Explore all iCloseLeads features: 11-source lead discovery, AI proposal generator, 6-stage CRM pipeline, cold email outreach, analytics, and free tools for freelancers.",
  keywords: ["freelance lead generation tool", "AI proposal generator freelancers", "freelance CRM software", "cold email outreach freelancers", "best tools for freelancers 2025"],
  openGraph: { title: "iCloseLeads Features", description: "Everything you need to find and close freelance clients." },
  alternates: { canonical: "https://icloseleads.com/features" },
};

const features = [
  {
    icon: Target,
    title: "Niche Targeting",
    description: "Select from 15+ specialized niches to find prospects that are a perfect match for your skills. Our niche intelligence means you get leads that actually need what you offer.",
    highlights: ["15+ professional niches", "Industry-specific search", "Revenue range filtering", "Company size filters"],
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary-light",
    iconBg: "bg-primary/15",
  },
  {
    icon: Search,
    title: "Email Discovery via Hunter.io",
    description: "Powered by Hunter.io's industry-leading email discovery engine. Get verified professional email addresses with confidence scores and LinkedIn profiles attached.",
    highlights: ["Verified email addresses", "Confidence scores (0-100%)", "LinkedIn & phone data", "Bulk domain search"],
    color: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
    iconBg: "bg-accent/15",
  },
  {
    icon: Sparkles,
    title: "AI Proposal Generation",
    description: "GPT-4o writes personalized proposals for each prospect based on your niche, bio, portfolio, and the specific company. Every proposal is unique, professional, and designed to convert.",
    highlights: ["GPT-4o powered", "Personalized per prospect", "Subject line optimization", "Tone customization"],
    color: "from-gold/20 to-gold/5",
    iconColor: "text-gold",
    iconBg: "bg-gold/15",
  },
  {
    icon: Mail,
    title: "Automated Outreach via Resend",
    description: "Send beautifully formatted emails directly from FreelanceFlow using Resend's enterprise-grade email infrastructure. Track every open, click, and response.",
    highlights: ["Enterprise deliverability", "HTML + plain text", "Reply tracking", "Spam score checking"],
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
  },
  {
    icon: BarChart2,
    title: "Analytics Dashboard",
    description: "Get deep insights into your outreach performance. See what niches perform best, what times get the most responses, and how to optimize for higher conversion rates.",
    highlights: ["30-day email trends", "Niche breakdown charts", "Response rate tracking", "Best send time insights"],
    color: "from-primary/20 to-accent/10",
    iconColor: "text-primary-light",
    iconBg: "bg-primary/15",
  },
  {
    icon: FileText,
    title: "Proposal Template Library",
    description: "Start from battle-tested templates for your niche instead of a blank page. Customize them to fit your voice, or let the AI use them as inspiration for fully personalized proposals.",
    highlights: ["5 built-in niche templates", "Save custom templates", "Template sharing", "A/B test variations"],
    color: "from-accent/20 to-primary/10",
    iconColor: "text-accent",
    iconBg: "bg-accent/15",
  },
];

const comparisonData = [
  { feature: "Verified email discovery", freelanceflow: true, upwork: false, fiverr: false, manual: false },
  { feature: "AI proposal generation", freelanceflow: true, upwork: false, fiverr: false, manual: false },
  { feature: "Direct email outreach", freelanceflow: true, upwork: false, fiverr: false, manual: true },
  { feature: "Analytics & tracking", freelanceflow: true, upwork: true, fiverr: false, manual: false },
  { feature: "No platform fees", freelanceflow: true, upwork: false, fiverr: false, manual: true },
  { feature: "No bidding war", freelanceflow: true, upwork: false, fiverr: false, manual: true },
  { feature: "Unlimited outreach", freelanceflow: true, upwork: false, fiverr: false, manual: true },
  { feature: "Control over pricing", freelanceflow: true, upwork: false, fiverr: false, manual: true },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-30" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h1 className="text-5xl font-extrabold text-foreground mb-4">
              Built for Freelancers Who <span className="gradient-text">Mean Business</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Every feature is designed to get you in front of the right clients, faster.
            </p>
          </div>
        </section>

        {/* Feature Deep-Dives */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                      <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">{feature.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`bg-gradient-to-br ${feature.color} border border-border rounded-2xl h-64 flex items-center justify-center ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <Icon className={`w-24 h-24 ${feature.iconColor} opacity-20`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 bg-surface">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">FreelanceFlow vs. The Alternatives</h2>
              <p className="text-muted-foreground">Why smart freelancers choose direct outreach over platform dependency.</p>
            </div>

            <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Feature</th>
                    <th className="text-center px-6 py-4 text-sm font-bold text-primary-light">FreelanceFlow</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-muted-foreground">Upwork</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-muted-foreground">Fiverr</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-muted-foreground">Manual Email</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-background/30"}`}>
                      <td className="px-6 py-4 text-sm text-foreground">{row.feature}</td>
                      {[row.freelanceflow, row.upwork, row.fiverr, row.manual].map((val, j) => (
                        <td key={j} className="text-center px-6 py-4">
                          {val ? (
                            <div className="inline-flex w-6 h-6 rounded-full bg-accent/10 items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-accent" />
                            </div>
                          ) : (
                            <div className="inline-flex w-6 h-6 rounded-full bg-red-500/10 items-center justify-center">
                              <X className="w-3.5 h-3.5 text-red-400" />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to try all these features?</h2>
            <p className="text-muted-foreground mb-8">Start for free — no credit card required.</p>
            <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all shadow-glow-primary">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
