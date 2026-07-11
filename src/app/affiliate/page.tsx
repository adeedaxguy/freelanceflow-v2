import type { Metadata } from "next";
import { DollarSign, Users, TrendingUp, Gift, CheckCircle2, Zap, BarChart2, Link2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Program — iCloseLeads",
  description: "Earn 30% recurring commission for every iCloseLeads customer you refer. Join our affiliate program and build a passive income stream.",
};

const steps = [
  { step: "1", title: "Sign Up", description: "Create your affiliate account in minutes. No approval process — any iCloseLeads user can join." },
  { step: "2", title: "Share Your Link", description: "Get a unique tracking link and share it on your blog, YouTube, social media, or with your audience." },
  { step: "3", title: "Earn Commissions", description: "Earn 30% recurring commission on every paying customer you refer — for the lifetime of their subscription." },
  { step: "4", title: "Get Paid", description: "Payouts via PayPal or Stripe every month for balances over $50. No waiting 90 days." },
];

const tiers = [
  {
    name: "Starter",
    condition: "0–5 active referrals",
    commission: "20%",
    perks: ["Unique tracking link", "Real-time dashboard", "Monthly payouts"],
    color: "border-border",
  },
  {
    name: "Partner",
    condition: "6–20 active referrals",
    commission: "25%",
    perks: ["Everything in Starter", "Priority support", "Co-marketing opportunities", "Affiliate newsletter"],
    color: "border-primary/40 bg-primary/5",
    highlight: true,
  },
  {
    name: "Super Affiliate",
    condition: "21+ active referrals",
    commission: "30%",
    perks: ["Everything in Partner", "Dedicated affiliate manager", "Custom landing pages", "Revenue share bonuses"],
    color: "border-gold/40 bg-gold/5",
  },
];

const stats = [
  { icon: DollarSign, value: "$285", label: "Avg monthly payout (top 10%)" },
  { icon: Users, value: "2,400+", label: "Active affiliates" },
  { icon: TrendingUp, value: "30%", label: "Lifetime recurring commission" },
  { icon: Gift, value: "$50", label: "Minimum payout threshold" },
];

const faqs = [
  { q: "How long does the cookie last?", a: "Our tracking cookie lasts 90 days. If someone clicks your link and upgrades within 90 days, you get credit for the referral." },
  { q: "Do I earn commission on upgrades?", a: "Yes. If a user you referred upgrades from Free to Pro or Agency, you earn commission on their new plan." },
  { q: "When do I get paid?", a: "Payouts are processed on the 15th of each month for the previous month's commissions. Minimum payout is $50." },
  { q: "Can I be an affiliate if I'm not a iCloseLeads user?", a: "Yes, but we recommend using the product yourself so you can give authentic recommendations. You can sign up for a free account to try it." },
  { q: "Are there any restrictions on promotion?", a: "You may not use paid ads that target iCloseLeads's brand name keywords, send spam, or misrepresent the product. Full details are in our affiliate agreement." },
];

export default function AffiliatePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-20" />
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider mb-6">
              Affiliate Program
            </span>
            <h1 className="text-5xl font-extrabold text-foreground mb-6">
              Earn <span className="gradient-text">30% Recurring</span> <br />
              Commission
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto mb-10">
              Refer freelancers to iCloseLeads and earn 30% recurring commission for the lifetime of their subscription. Turn your audience into passive income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup&intent=affiliate-program&source=affiliate-hero" className="px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold text-lg transition-colors">
                Join the Program
              </Link>
              <a href="#how-it-works" className="px-8 py-4 bg-surface border border-border hover:border-primary/30 text-foreground rounded-xl font-semibold text-lg transition-all">
                How It Works
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-surface border-y border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <p className="text-2xl font-extrabold text-foreground mb-1">{value}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="relative">
                  <div className="p-6 rounded-2xl bg-surface border border-border h-full">
                    <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white font-bold text-lg mb-4">
                      {step}
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commission Tiers */}
        <section className="py-20 bg-surface">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">Commission Tiers</h2>
            <p className="text-muted-foreground text-center mb-12">The more you refer, the more you earn. Tiers are evaluated monthly.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div key={tier.name} className={`p-6 rounded-2xl border-2 ${tier.color} relative`}>
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{tier.condition}</p>
                  <p className="text-4xl font-extrabold gradient-text mb-1">{tier.commission}</p>
                  <p className="text-xs text-muted-foreground mb-6">recurring commission</p>
                  <ul className="space-y-2">
                    {tier.perks.map(perk => (
                      <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Affiliate tools */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Tools We Provide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Link2, title: "Tracking Links", description: "Custom UTM-tracked links with 90-day cookie attribution." },
                { icon: BarChart2, title: "Real-Time Dashboard", description: "See clicks, signups, conversions, and commissions in one place." },
                { icon: Gift, title: "Marketing Assets", description: "Banners, email templates, social graphics, and review guides." },
                { icon: Zap, title: "Product Updates", description: "Be the first to know about new features to share with your audience." },
                { icon: DollarSign, title: "Monthly Payouts", description: "PayPal or Stripe payouts every month with no hidden fees." },
                { icon: Users, title: "Affiliate Community", description: "Private Slack channel for top affiliates to share strategies." },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="p-6 rounded-2xl bg-surface border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-surface">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group bg-background border border-border rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-foreground font-medium text-sm hover:text-primary-light transition-colors list-none">
                    {q}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Ready to Start Earning?</h2>
            <p className="text-muted-foreground mb-8">Join 2,400+ affiliates earning recurring commissions with iCloseLeads.</p>
            <Link href="/auth?mode=signup&intent=affiliate-program&source=affiliate-final-cta" className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold text-lg transition-colors">
              <Zap className="w-5 h-5" /> Join the Affiliate Program
            </Link>
            <p className="text-xs text-muted-foreground mt-4">Questions? Email us at <a href="mailto:affiliates@icloseleads.com" className="text-primary-light hover:underline">affiliates@icloseleads.com</a></p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
