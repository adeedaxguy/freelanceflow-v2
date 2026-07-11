import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Layers,
  Search,
  Sparkles,
  Mail,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureInteractiveDemo from "@/components/FeatureInteractiveDemo";
import { FEATURE_PAGES, type IconName } from "@/data/feature-pages";
import { cn } from "@/lib/utils";

const BASE_URL = "https://icloseleads.com";

const ICONS: Record<IconName, React.ElementType> = {
  Search,
  Sparkles,
  Mail,
  Layers,
  BarChart2,
  Wrench,
  Target: Search,
  Shield,
  Clock: Zap,
  FileText: Sparkles,
  TrendingUp: BarChart2,
  CheckCircle2,
  Zap,
  Users: Layers,
  MessageSquare: Mail,
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  const IconComponent = ICONS[name] ?? Sparkles;
  return <IconComponent className={className} />;
}

function OverviewJsonLd() {
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "iCloseLeads",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BASE_URL,
      description:
        "Client acquisition software for freelancers with lead discovery, AI proposals, Gmail-ready outreach, CRM pipeline, analytics, and free tools.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: FEATURE_PAGES.map(page => page.eyebrow),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "iCloseLeads feature pages",
      itemListElement: FEATURE_PAGES.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: page.eyebrow,
        url: `${BASE_URL}${page.path}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Features",
          item: `${BASE_URL}/features`,
        },
      ],
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

const comparisonRows = [
  ["Find fresh remote job leads", true, false, false, false],
  ["Find local business leads", true, false, false, true],
  ["Check owner or manager contact paths", true, false, false, false],
  ["Generate lead-specific proposals", true, false, false, false],
  ["Prepare Gmail drafts safely", true, false, false, true],
  ["Track saved leads in CRM", true, true, false, false],
  ["Review prospecting analytics", true, true, false, false],
  ["Avoid marketplace bidding wars", true, false, false, true],
];

const panelSurface =
  "rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))]";

export default function FeatureOverviewPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <OverviewJsonLd />
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(159,103,255,0.10),rgba(0,229,160,0.045),rgba(9,9,21,0))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-light">
                <Zap className="h-4 w-4" />
                iCloseLeads Features
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Features that turn lead signals{" "}
                <span className="bg-gradient-to-r from-primary-light via-accent to-blue-400 bg-clip-text text-transparent">
                  into client conversations
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                iCloseLeads connects discovery, decision maker checks, AI proposals, Gmail-ready outreach, CRM tracking, analytics, and freelancer tools into one focused workflow for winning direct clients.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=signup&intent=features-overview&source=features-hero"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
                >
                  Run first search free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features/lead-discovery"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  See Lead Discovery
                </Link>
              </div>
            </div>
            <FeatureInteractiveDemo type="overview" />
          </div>
        </section>

        <section className="border-b border-border bg-surface/35 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["3", "Discovery paths"],
              ["6", "Core feature areas"],
              ["1", "CRM-backed workflow"],
              ["0", "Credit card required"],
            ].map(([value, label]) => (
              <div key={label} className="flex min-h-[104px] flex-col items-center justify-center rounded-2xl border border-border bg-background/65 px-4 py-4 text-center">
                <p className="text-2xl font-extrabold text-accent">{value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-light">Feature Stack</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Every page has one job: move a lead closer to revenue
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The platform is not a loose collection of AI widgets. Each feature sits in the same acquisition loop: find the prospect, write the pitch, prepare the outreach, track the follow-up, and learn what worked.
              </p>
            </div>
            <div className="mt-12 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURE_PAGES.map(page => (
                <Link
                  key={page.slug}
                  href={page.path}
                  className={cn(panelSurface, "group flex h-full min-h-[250px] flex-col p-5 transition-all", page.theme.hoverBorder)}
                >
                  <div className={cn("mb-5 flex h-11 w-11 items-center justify-center rounded-lg border", page.theme.accentBg, page.theme.accentBorder)}>
                    <Icon name={page.icon} className={cn("h-5 w-5", page.theme.accentText)} />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary-light">{page.eyebrow}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{page.shortDescription}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary-light">
                    Explore feature
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-light">Direct Outreach</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
                Why freelancers need a system outside marketplaces
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Marketplaces are useful, but they also create bidding pressure, platform dependency, and weak positioning. iCloseLeads is for freelancers who want to build their own pipeline: find buyers, pitch directly, follow up consistently, and keep ownership of the client relationship.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border bg-background">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[1.35fr_repeat(4,minmax(72px,1fr))] border-b border-border px-4 py-3 text-xs font-bold text-muted-foreground">
                  <span>Workflow</span>
                  <span className="text-center text-primary-light">iCloseLeads</span>
                  <span className="text-center">Marketplace</span>
                  <span className="text-center">Generic CRM</span>
                  <span className="text-center">Manual</span>
                </div>
                {comparisonRows.map(([label, iclose, market, crm, manual]) => (
                  <div key={label as string} className="grid grid-cols-[1.35fr_repeat(4,minmax(72px,1fr))] border-b border-border/60 px-4 py-3 text-sm last:border-0">
                    <span className="text-foreground">{label}</span>
                    {[iclose, market, crm, manual].map((ok, index) => (
                      <span key={index} className="flex justify-center">
                        {ok ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-border" />
                        )}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-2xl border border-primary/25 bg-primary/10 p-8 text-center">
            <Sparkles className="mx-auto mb-5 h-10 w-10 text-primary-light" />
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Start with one search, not a full sales department
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Pick a niche, find real opportunities, save the best leads, and write the first pitch from the same workspace.
            </p>
            <Link
              href="/auth?mode=signup&intent=features-overview&source=features-final-cta"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
            >
              Try iCloseLeads Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
