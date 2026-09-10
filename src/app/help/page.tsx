import type { Metadata } from "next";
import { Search, BookOpen, Zap, CreditCard, Mail, Settings, ChevronDown, MessageCircle, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center — iCloseLeads",
  description: "Find answers to common questions about iCloseLeads. Get help with lead search, proposals, billing, email sending, and account settings.",
  alternates: { canonical: "https://icloseleads.com/help" },
};

const categories = [
  {
    icon: Zap,
    title: "Getting Started",
    color: "text-primary-light",
    bg: "bg-primary/10",
    href: "#getting-started",
  },
  {
    icon: Search,
    title: "Finding Leads",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    href: "#finding-leads",
  },
  {
    icon: Mail,
    title: "Proposals & Email",
    color: "text-green-400",
    bg: "bg-green-500/10",
    href: "#proposals",
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    href: "#billing",
  },
  {
    icon: Settings,
    title: "Account Settings",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    href: "#account",
  },
  {
    icon: BookOpen,
    title: "API & Integrations",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    href: "#api",
  },
];

const faqs = [
  {
    id: "getting-started",
    title: "Getting Started",
    questions: [
      {
        q: "How do I find my first lead?",
        a: "Go to Dashboard → Find Leads. Enter your niche (e.g., 'web development' or 'copywriting'), choose your filters, and click Search. iCloseLeads aggregates live results in seconds. You'll see leads sorted by freshness — the most recently posted jobs first.",
      },
      {
        q: "What is a 'niche' and how should I choose mine?",
        a: "A niche is the specific service you offer and the industry you serve. For best results, be specific. Instead of 'developer', use 'React developer for SaaS' or 'WordPress developer for ecommerce'. You can search up to 5 niches simultaneously on Pro and Agency plans.",
      },
      {
        q: "How long does it take to land a client using iCloseLeads?",
        a: "Results depend on your niche, offer, outreach quality, and follow-up consistency. Start by checking a lead's original source, tailor your message to its actual needs, and track replies in your pipeline. Finding a lead does not guarantee a client or income.",
      },
      {
        q: "What happens during and after my free 3-day trial?",
        a: "Your trial lasts 72 hours from registration and includes up to 600 lead results shared across Local, Remote, and Live Jobs, AI drafts, website concepts, and up to 50 outreach messages per day. No card or automatic charge. After expiry, new searches, AI tools, and outreach require Pro ($10/month) or Agency ($15/month). Saved work and support remain available; paid calling add-ons are separate.",
      },
    ],
  },
  {
    id: "finding-leads",
    title: "Finding Leads",
    questions: [
      {
        q: "Where do the leads come from?",
        a: "iCloseLeads combines live hiring signals, public web opportunities, community posts, and local business coverage. New coverage is added regularly so users can find fresh opportunities without checking dozens of sites manually.",
      },
      {
        q: "Why don't I see leads from LinkedIn or Indeed?",
        a: "Some large platforms restrict automated access to their data. iCloseLeads focuses on reliable, compliant coverage that can be searched consistently and safely.",
      },
      {
        q: "What does the confidence score mean?",
        a: "The confidence score (0-100) indicates how strong a hiring signal the lead represents. It's calculated from factors like: how recently the job was posted, whether it mentions a budget or freelance rate, whether the company has a verified domain, and keyword relevance to your niche.",
      },
      {
        q: "How do I filter leads to only show those with email addresses?",
        a: "On the lead search results page, toggle the 'Has Email' filter. iCloseLeads enriches leads using company websites and contact discovery signals. Always verify contact details before outreach.",
      },
      {
        q: "Why are some leads showing the same company multiple times?",
        a: "A company may be hiring for multiple roles, or the same role may appear on multiple job boards. We deduplicate across sources, but if the job title or description differs, it may appear as a separate lead. Use the keyword filter to narrow results.",
      },
    ],
  },
  {
    id: "proposals",
    title: "Proposals & Email",
    questions: [
      {
        q: "How does the AI proposal generator work?",
        a: "Click 'Generate Proposal' on any lead. The AI reads the job description, your profile (niche, bio, portfolio URL), and writes a personalized, professional proposal in under 10 seconds. You can edit it before preparing outreach.",
      },
      {
        q: "Does iCloseLeads send emails on my behalf?",
        a: "The safest default workflow is Gmail compose mode. iCloseLeads prepares the email draft, and you review and send manually from your own Gmail account.",
      },
      {
        q: "How do I set up my email address for sending?",
        a: "Use the proposal page's 'Prepare in Gmail' action. It opens Gmail with the recipient, subject, and message filled in, so you stay in control before sending.",
      },
      {
        q: "Can I save and reuse proposal templates?",
        a: "Yes. After generating or writing a proposal, click 'Save as Template'. Your templates are available in any future proposal for quick insertion and editing.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Plans",
    questions: [
      {
        q: "How does billing work?",
        a: "New accounts receive a free 3-day trial without a card. Continued searches after the trial require Pro or Agency. Upgrades, softphone numbers, and calling-minute packages use secure Stripe checkout, with subscription changes managed from the billing portal.",
      },
      {
        q: "What payment methods do you accept?",
        a: "Paid subscriptions use a secure hosted checkout from our payment provider. Available payment methods are shown at checkout, and iCloseLeads does not store your card details.",
      },
      {
        q: "Do you offer refunds?",
        a: "Your first paid subscription includes a 14-day money-back guarantee. See the Refund Policy for eligibility and contact billing@icloseleads.com for help.",
      },
      {
        q: "What happens to my leads if I cancel my plan?",
        a: "Your saved leads are retained. After paid access ends, new searches, AI tools, and outreach require an active plan once your original 3-day trial has expired. Cancelling does not restart the trial. Phone numbers and calling minutes remain separate paid add-ons.",
      },
    ],
  },
  {
    id: "account",
    title: "Account Settings",
    questions: [
      { q: "Where can I update my profile?", a: "Open Profile in the dashboard to update your freelance details, niche, and portfolio links. These details help personalize your proposals." },
      { q: "How can I reset my password?", a: "Use Forgot password on the sign-in page and enter your account email. Follow the link sent to that inbox to choose a password. If it does not arrive, check spam or contact support." },
    ],
  },
  {
    id: "api",
    title: "API & Integrations",
    questions: [
      { q: "Which plan includes API access?", a: "API access is available to Agency accounts. Open the API page in your dashboard to manage keys, and see the developer documentation for endpoints and usage limits. Keep API keys on your server, not in browser code." },
      { q: "Are softphone costs included in my subscription?", a: "No. The calling workspace is available with separate paid phone-number and calling-minute add-ons. Buying Pro or Agency alone does not include a phone number or minutes." },
    ],
  },
];

export default async function HelpPage({ searchParams }: { searchParams?: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = (typeof params?.q === "string" ? params.q : "").trim().slice(0, 200);
  const matchingSections = faqs.map(section => ({
    ...section,
    questions: section.questions.filter(({ q, a }) => `${q} ${a}`.toLowerCase().includes(query.toLowerCase())),
  })).filter(section => section.questions.length > 0);
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Hero / Search */}
        <section className="py-20 bg-surface border-b border-border">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold text-foreground mb-4">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-muted-foreground mb-8">Search our knowledge base or browse categories below.</p>
            <form action="/help" method="get" role="search" className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="search"
                name="q"
                aria-label="Search help articles"
                defaultValue={query}
                maxLength={200}
                placeholder="Search for answers..."
                className="w-full pl-12 pr-16 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-base"
              />
              <button type="submit" aria-label="Search help" title="Search help" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
          {/* Categories */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map(({ icon: Icon, title, color, bg, href }) => (
                <a key={title} href={query ? `/help${href}` : href} className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{faqs.find(section => `#${section.id}` === href)?.questions.length ?? 0} answers</p>
                </a>
              ))}
            </div>
          </section>

          {/* FAQs */}
          {query && <div role="status">
            <p className="text-foreground">{matchingSections.length ? `Answers matching "${query}"` : `No answers found for "${query}".`}</p>
            <Link href="/help" className="mt-2 inline-block text-primary-light underline">Show all answers</Link>
          </div>}
          {matchingSections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-2xl font-bold text-foreground mb-6">{section.title}</h2>
              <div className="space-y-3">
                {section.questions.map(({ q, a }) => (
                  <details key={q} className="group bg-surface border border-border rounded-2xl overflow-hidden">
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-foreground font-medium text-sm hover:text-primary-light transition-colors list-none">
                      {q}
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                    </summary>
                    <div className="px-6 pb-5">
                      <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* Still need help */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center">
              <MessageCircle className="w-8 h-8 text-primary-light mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">Chat with Support</h3>
              <p className="text-muted-foreground text-sm mb-4">Can&apos;t find your answer? Send the team a message and track your request.</p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-medium transition-colors">
                Open a Ticket
              </Link>
            </div>
            <div className="p-6 rounded-2xl bg-surface border border-border text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">API Documentation</h3>
              <p className="text-muted-foreground text-sm mb-4">Building on top of iCloseLeads? Check out our developer docs.</p>
              <Link href="/developers" className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-border hover:border-primary/30 text-foreground rounded-xl text-sm font-medium transition-all">
                View API Docs
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": matchingSections.flatMap(section =>
          section.questions.map(({ q, a }) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a },
          }))
        ),
      }) }} />
    </>
  );
}
