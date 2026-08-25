export interface Testimonial {
  name: string; role: string; company?: string; avatar: string;
  content: string; rating: number; niche?: string;
}

export interface PricingTier {
  name: string; price: string; period?: string; description: string;
  features: string[]; cta: string; href: string; highlight?: boolean; badge?: string; comingSoon?: boolean;
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
    name: "Free",
    price: "$0",
    description: "Full early access to core lead, proposal, CRM tools, and optional softphone add-ons.",
    limit: "600 leads/week",
    features: [
      "600 leads per week during Early Access",
      "5 AI proposals per week",
      "3 free tools (Rate Calc, Subject Gen, Red Flag)",
      "Live job and local lead discovery",
      "Softphone option with number and minute add-ons",
      "3 active campaigns",
      "Community + email support",
    ],
    cta: "Start for Free",
    href: "/auth?mode=signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "mo",
    description: "Everything you need to land clients consistently.",
    limit: "500 leads/week",
    features: [
      "1,000 leads per week",
      "Unlimited AI proposals (Groq-powered)",
      "Priority freshness across lead discovery",
      "Softphone option with number and minute add-ons",
      "10 active campaigns",
      "CSV export + CRM sync",
      "Analytics dashboard",
      "Priority email support",
      "Custom proposal templates",
    ],
    comingSoon: true,
    cta: "Join Waitlist — $29/mo",
    href: "#waitlist",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: "$79",
    period: "mo",
    description: "For agencies running outreach at scale.",
    limit: "Unlimited leads",
    features: [
      "Unlimited leads",
      "Unlimited AI proposals",
      "White-label templates",
      "Softphone option with number and minute add-ons",
      "Unlimited campaigns",
      "5 team seats",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
      "SLA support",
    ],
    cta: "Join Waitlist",
    href: "#waitlist",
    comingSoon: true,
  },
];
