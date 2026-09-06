import { PLAN_MONTHLY_PRICES, PLAN_FEATURES } from "@/lib/plan-pricing";

export interface Testimonial {
  name: string; role: string; company?: string; avatar: string;
  content: string; rating: number; niche?: string;
}

export interface PricingTier {
  name: string; price: string; period?: string; description: string;
  features: string[]; cta: string; href: string; highlight?: boolean; badge?: string;
  limit?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  { name: "Marcus R.", role: "Full-Stack Developer", company: "Independent", avatar: "MR",
    content: "The biggest change is speed. I can find a relevant remote lead, draft a sensible opener, and save the follow-up without jumping between five tabs.", rating: 5, niche: "Web Dev" },
  { name: "Sofia A.", role: "Brand Designer", company: "Studio owner", avatar: "SA",
    content: "The proposals do not feel like a blank AI template. They give me a researched first draft, then I add my examples and send something much stronger.", rating: 5, niche: "Branding" },
  { name: "James O.", role: "SEO Consultant", company: "Independent", avatar: "JO",
    content: "Local Business Leads is the part I use most. The website-status angle gives me a real reason to reach out instead of sending generic SEO pitches.", rating: 5, niche: "SEO" },
  { name: "Priya N.", role: "Webflow Developer", company: "Freelance", avatar: "PN",
    content: "I like that the tool separates timing signals from random volume. Fewer leads, better fit, and the pipeline makes it obvious who needs a follow-up.", rating: 5, niche: "Webflow" },
  { name: "Daniel K.", role: "Paid Social Freelancer", company: "Solo consultant", avatar: "DK",
    content: "Remote Jobs helped me catch smaller teams already asking for help with Meta ads. The suggested angle is usually close enough that editing takes minutes.", rating: 5, niche: "Meta Ads" },
  { name: "Amelia S.", role: "Copywriter", company: "Independent", avatar: "AS",
    content: "The Decision Maker path is useful for local prospects. I can check the owner route, public profile, and phone path before deciding if the lead is worth pitching.", rating: 5, niche: "Copywriting" },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "3-Day Trial",
    price: "$0",
    description: "Find your first prospects and prepare your pitch. No card required.",
    limit: "600 leads for 3 days",
    features: [...PLAN_FEATURES.free],
    cta: "Start 3-Day Trial",
    href: "/auth?mode=signup",
  },
  {
    name: "Pro",
    price: `$${PLAN_MONTHLY_PRICES.pro}`,
    period: "mo",
    description: "For a freelancer building a focused prospecting routine.",
    limit: "1,000 leads/week",
    features: [...PLAN_FEATURES.pro],
    cta: "Upgrade to Pro",
    href: "/dashboard/upgrade?plan=pro",
    highlight: true,
    badge: "For solo outreach",
  },
  {
    name: "Agency",
    price: `$${PLAN_MONTHLY_PRICES.agency}`,
    period: "mo",
    description: "For higher-volume prospecting and your own API workflows. $5 more than Pro.",
    limit: "Unlimited leads",
    features: [...PLAN_FEATURES.agency],
    cta: "Upgrade to Agency",
    href: "/dashboard/upgrade?plan=agency",
  },
];
