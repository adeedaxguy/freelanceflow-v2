import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Mail,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureInteractiveDemo from "@/components/FeatureInteractiveDemo";
import { FEATURE_PAGES, type FeatureItem, type FeaturePageData, type IconName } from "@/data/feature-pages";
import { cn } from "@/lib/utils";

const BASE_URL = "https://icloseleads.com";

const ICONS: Record<IconName, React.ElementType> = {
  Search,
  Sparkles,
  Mail,
  Layers,
  BarChart2,
  Wrench,
  Target,
  Shield,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle2,
  Zap,
  Users,
  MessageSquare,
};

function FeatureIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}

function JsonLd({ page }: { page: FeaturePageData }) {
  const url = `${BASE_URL}${page.path}`;
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: `iCloseLeads ${page.eyebrow}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url,
      description: page.metaDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: page.capabilities.map(item => item.title),
      publisher: {
        "@type": "Organization",
        name: "iCloseLeads",
        url: BASE_URL,
      },
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
        {
          "@type": "ListItem",
          position: 3,
          name: page.eyebrow,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map(faq => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-light">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>}
    </div>
  );
}

function FeatureCard({ item, page }: { item: FeatureItem; page: FeaturePageData }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5 transition-all", page.theme.hoverBorder)}>
      <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-lg border", page.theme.accentBg, page.theme.accentBorder)}>
        <FeatureIcon name={item.icon} className={cn("h-5 w-5", page.theme.accentText)} />
      </div>
      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
    </div>
  );
}

export default function FeatureMarketingPage({ page }: { page: FeaturePageData }) {
  const otherFeatures = FEATURE_PAGES.filter(item => item.slug !== page.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd page={page} />
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", page.theme.heroWash)} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
            <div>
              <div className={cn("mb-5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold", page.theme.accentBg, page.theme.accentBorder, page.theme.accentText)}>
                <FeatureIcon name={page.icon} className="h-4 w-4" />
                {page.eyebrow}
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {page.title}{" "}
                <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", page.theme.gradientText)}>
                  {page.accentTitle}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{page.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
                >
                  {page.cta.button}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-surface/70 px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  View All Features
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["No credit card", "Free during launch", "Built for freelancers"].map(label => (
                  <span key={label} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <FeatureInteractiveDemo type={page.slug} />
          </div>
        </section>

        <section className="border-b border-border bg-surface/35 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
            {page.stats.map(stat => (
              <div key={stat.label} className="rounded-lg border border-border bg-background/65 px-4 py-4 text-center">
                <p className={cn("text-2xl font-extrabold", page.theme.accentText)}>{stat.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-light">Why It Matters</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
                Built for the way freelancers actually win clients
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>{page.audience}</p>
              <p>{page.promise}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {page.proof.map(point => (
                  <div key={point} className="rounded-lg border border-border bg-surface p-4 text-sm leading-6">
                    <CheckCircle2 className="mb-3 h-4 w-4 text-accent" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Workflow"
            title={`How ${page.eyebrow.toLowerCase()} works inside iCloseLeads`}
            description="The pages are optimized for search, but the product story stays grounded in the actual user journey."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-4">
            {page.workflow.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-border bg-background p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", page.theme.accentBg, page.theme.accentBorder)}>
                    <FeatureIcon name={item.icon} className={cn("h-5 w-5", page.theme.accentText)} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Capabilities"
            title="What users can do on this page"
            description="Each feature page explains the practical job-to-be-done, not just a list of generic SaaS benefits."
          />
          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
            {page.capabilities.map(item => (
              <FeatureCard key={item.title} item={item} page={page} />
            ))}
          </div>
        </section>

        <section id="use-cases" className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-light">Use Cases</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
                Where this feature earns its place
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Freelancers do not need more software to babysit. They need specific workflows that reduce uncertainty and lead to action.
              </p>
            </div>
            <div className="grid gap-4">
              {page.useCases.map(item => (
                <div key={item.title} className="grid gap-4 rounded-lg border border-border bg-background p-5 sm:grid-cols-[44px_1fr]">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg border", page.theme.accentBg, page.theme.accentBorder)}>
                    <FeatureIcon name={item.icon} className={cn("h-5 w-5", page.theme.accentText)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="difference" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Positioning"
              title="Why this feels different from generic AI tools"
              description="The page copy is written to show product judgment: fewer empty promises, more concrete workflow detail."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {page.differentiators.map(point => (
                <div key={point} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-border bg-surface/35 px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title={`Questions about ${page.eyebrow.toLowerCase()}`} />
          <div className="mx-auto mt-12 grid max-w-4xl gap-4">
            {page.faqs.map(faq => (
              <div key={faq.q} className="rounded-lg border border-border bg-background p-5">
                <h3 className="text-base font-bold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-lg border border-primary/25 bg-primary/10 p-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{page.cta.heading}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{page.cta.subheading}</p>
            <Link
              href="/auth?mode=signup"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-glow-primary transition-all hover:bg-primary-light"
            >
              {page.cta.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-surface/30 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-sm font-semibold text-muted-foreground">Explore more iCloseLeads features</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherFeatures.map(item => (
                <Link
                  key={item.slug}
                  href={item.path}
                  className="group rounded-lg border border-border bg-background/70 p-4 transition-all hover:border-primary/35"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", item.theme.accentBg, item.theme.accentBorder)}>
                      <FeatureIcon name={item.icon} className={cn("h-4 w-4", item.theme.accentText)} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary-light">{item.eyebrow}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.shortDescription}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
