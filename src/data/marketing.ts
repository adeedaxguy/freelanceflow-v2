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
  { name: "Marcus Reid", role: "Full-Stack Developer", company: "Independent", avatar: "MR",
    content: "In my first month I found 23 qualified leads across 16 sources and landed 2 contracts worth $18,000. The AI proposals are scarily good.", rating: 5, niche: "Web Development" },
  { name: "Sofia Andersen", role: "Brand Designer", company: "Sofia Design Studio", avatar: "SA",
    content: "My response rate went from 3% to 19%. iCloseLeads handles the research and drafts my proposals — I just personalize and send.", rating: 5, niche: "UI/UX Design" },
  { name: "James Okafor", role: "SEO Consultant", company: "Growth.io", avatar: "JO",
    content: "Real people posting HIRING right now — not a cold email list. This tool pays for itself 10x every single month.", rating: 5, niche: "SEO" },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Full access to all features. No card, no limits. Seriously.",
    limit: "20 leads/week",
    features: [
      "100 leads per week",
      "5 AI proposals per week",
      "3 free tools (Rate Calc, Subject Gen, Red Flag)",
      "All 16 live sources included",
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
      "All lead sources + priority freshness",
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
