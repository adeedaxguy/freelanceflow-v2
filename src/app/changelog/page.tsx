import type { Metadata } from "next";
import { Zap, Bug, Sparkles, Shield, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Changelog — iCloseLeads",
  description: "See what's new in iCloseLeads. Product updates, new features, bug fixes, and improvements — updated regularly.",
};

const releases = [
  {
    version: "v2.4.0",
    date: "April 2025",
    badge: "Latest",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    changes: [
      { type: "feature", text: "19 live lead sources — added AuthenticJobs, JustRemote, FreelancerMap, and Gun.io" },
      { type: "feature", text: "Multi-niche search — search up to 5 niches simultaneously in one query" },
      { type: "feature", text: "SEO Blog Editor — full Yoast-style editor with focus keyword scoring and Google preview" },
      { type: "feature", text: "Admin Panel v2 — revenue tracking, MRR charts, support tickets, audit log, broadcast messaging" },
      { type: "improvement", text: "Lead freshness sort — results now sorted by most recent posting first" },
      { type: "improvement", text: "HTML entity decoding in job descriptions — no more raw &lt;tags&gt; in previews" },
      { type: "fix", text: "Fixed Upwork RSS feed not returning results" },
      { type: "fix", text: "Fixed floating chat and help buttons overlapping on mobile" },
    ],
  },
  {
    version: "v2.3.0",
    date: "March 2025",
    badge: null,
    badgeColor: "",
    changes: [
      { type: "feature", text: "Dark/light mode toggle with system preference detection and no flash on load" },
      { type: "feature", text: "Email enrichment via website scraping — find contact emails even without Hunter.io" },
      { type: "feature", text: "Proposal templates — save and reuse your best performing templates" },
      { type: "improvement", text: "Sidebar navigation refresh with grouped sections and active state indicators" },
      { type: "improvement", text: "Lead deduplication — user-specific saved leads filtered from search results" },
      { type: "fix", text: "Fixed proposal AI generation failing when company name contained special characters" },
    ],
  },
  {
    version: "v2.2.0",
    date: "February 2025",
    badge: null,
    badgeColor: "",
    changes: [
      { type: "feature", text: "Upwork and WeWorkRemotely added as lead sources" },
      { type: "feature", text: "Lead quality scoring — composite score based on email presence, recency, and signal strength" },
      { type: "feature", text: "Interactive onboarding tour for new users" },
      { type: "improvement", text: "Usage caps now show real-time remaining leads with visual progress bar" },
      { type: "fix", text: "Fixed session expiry causing silent 401s on lead save" },
      { type: "fix", text: "Fixed Reddit RSS parsing edge cases with unicode job titles" },
    ],
  },
  {
    version: "v2.1.0",
    date: "January 2025",
    badge: null,
    badgeColor: "",
    changes: [
      { type: "feature", text: "AI proposal generator powered by GPT-4o — personalized proposals in under 10 seconds" },
      { type: "feature", text: "Email sending via Resend with deliverability tracking" },
      { type: "feature", text: "Saved leads dashboard with pipeline status (New → Contacted → Replied → Won)" },
      { type: "improvement", text: "Lead card redesign with company logo, confidence badge, and quick-save action" },
    ],
  },
  {
    version: "v2.0.0",
    date: "December 2024",
    badge: "Major Release",
    badgeColor: "bg-primary/10 text-primary-light border-primary/20",
    changes: [
      { type: "feature", text: "Complete platform rewrite in Next.js 14 with App Router and TypeScript" },
      { type: "feature", text: "15 initial lead sources: RemoteOK, Remotive, Reddit, HimalaYas, Jobicy, and more" },
      { type: "feature", text: "Hunter.io email enrichment integration" },
      { type: "feature", text: "Pro and Agency subscription plans via Stripe" },
      { type: "feature", text: "Admin panel with user management and usage monitoring" },
    ],
  },
];

const typeConfig = {
  feature: { icon: Sparkles, color: "text-primary-light", bg: "bg-primary/10", label: "New" },
  improvement: { icon: ArrowUpRight, color: "text-blue-400", bg: "bg-blue-500/10", label: "Improved" },
  fix: { icon: Bug, color: "text-orange-400", bg: "bg-orange-500/10", label: "Fixed" },
  security: { icon: Shield, color: "text-green-400", bg: "bg-green-500/10", label: "Security" },
} as const;

type ChangeType = keyof typeof typeConfig;

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Hero */}
        <section className="py-16 border-b border-border">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-foreground">Changelog</h1>
                <p className="text-muted-foreground text-sm">What&apos;s new in iCloseLeads</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We ship fast and we ship often. Here&apos;s a full record of every feature, improvement, and fix — so you always know what&apos;s changed.
            </p>
          </div>
        </section>

        {/* Releases */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="space-y-12">
              {releases.map((release) => (
                <div key={release.version} className="relative">
                  {/* Version header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{release.version}</h2>
                      {release.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${release.badgeColor}`}>
                          {release.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm ml-auto">{release.date}</span>
                  </div>

                  {/* Changes */}
                  <div className="space-y-3 pl-4 border-l-2 border-border">
                    {release.changes.map((change, i) => {
                      const config = typeConfig[change.type as ChangeType] ?? typeConfig.feature;
                      const Icon = config.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-semibold ${config.color} mr-2`}>{config.label}</span>
                            <span className="text-sm text-muted-foreground">{change.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Subscribe CTA */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Get notified about updates</h3>
              <p className="text-muted-foreground text-sm mb-5">Subscribe to our newsletter for product updates and freelance growth tips.</p>
              <form className="flex gap-2 max-w-sm mx-auto" action="#">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <button type="submit" className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
