import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { PRICING_TIERS } from "@/data/marketing";
import { PLAN_MONTHLY_PRICES } from "@/lib/plan-pricing";
import { seoDescription, seoTitle } from "@/lib/seo-copy";

export const metadata: Metadata = {
  title: { absolute: seoTitle("Pricing Plans for Freelancers") },
  description: seoDescription(`Start free, upgrade when ready. Plans run from $0 to $${PLAN_MONTHLY_PRICES.agency}/mo with lead discovery, AI proposals, outreach, CRM, and optional softphone add-ons.`),
  alternates: { canonical: "https://icloseleads.com/pricing" },
};

const billingFAQ = [
  { q: "Can I change plans anytime?", a: "Yes. Paid subscriptions are managed through the secure Stripe billing portal." },
  { q: "Can every plan use the softphone?", a: "Yes. Every plan can access the softphone option. Phone numbers and monthly calling minute packages are separate paid add-ons, so calling costs stay tied to actual phone usage." },
  { q: "How are payments handled?", a: "Pro, Agency, softphone number subscriptions, and calling-minute packages use secure Stripe Checkout. iCloseLeads does not store card details." },
  { q: "What happens after the free trial?", a: "You get up to 600 lead results over 3 days, starting when you register. After that, choose Pro or Agency to continue new lead searches and AI proposals. Your saved leads and outreach history remain accessible. There is no automatic charge." },
  { q: "When should I choose Agency?", a: "Choose Agency for more than 1,000 lead results a week, a larger outreach allowance, or API access. It is a single-user account, not a shared team workspace. Lead availability varies by source and location." },
  { q: "What happens when I hit my weekly lead limit?", a: "You will be notified and can upgrade your plan. Existing saved leads and emails remain accessible." },
  { q: "Do you offer annual billing?", a: "Yes. Annual billing is available from the dashboard upgrade page and is shown before checkout." },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-extrabold text-foreground mb-4">
                Simple Pricing, <span className="gradient-text">No Surprises</span>
              </h1>
              <p className="text-muted-foreground text-xl max-w-xl mx-auto">
                Start free. Upgrade as you grow. Add softphone calling when you are ready.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-16">
              {PRICING_TIERS.map((tier, i) => <PricingCard key={tier.name} tier={tier} index={i} />)}
            </div>

            {/* Launch assurance */}
            <div className="flex items-center justify-center gap-4 p-6 bg-gradient-card border border-accent/20 rounded-2xl max-w-lg mx-auto mb-24">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-foreground font-semibold">Start free, upgrade through Stripe</div>
                <div className="text-muted-foreground text-sm">Try the core workflow without a card. Paid plans, softphone numbers, and calling minutes use secure Stripe checkout.</div>
              </div>
            </div>

            {/* Billing FAQ */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">Billing Questions</h2>
              <div className="space-y-3">
                {billingFAQ.map((faq) => (
                  <details key={faq.q} className="group bg-gradient-card border border-border rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-foreground font-medium hover:text-primary-light transition-colors list-none">
                      {faq.q}
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                    </summary>
                    <div className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-surface">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">Our team is happy to help you find the right plan.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground hover:border-primary/50 hover:text-primary-light transition-all">
              Talk to us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "PriceSpecification", "name": "iCloseLeads Pricing", "priceCurrency": "USD" }) }} />
    </>
  );
}
