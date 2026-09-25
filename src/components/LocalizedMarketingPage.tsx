import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, Target, UserRoundSearch } from "lucide-react";
import Logo from "@/components/Logo";
import { localizedMarketing, type LocalizedPageKey } from "@/data/localized-marketing";
import { LOCALE_LABELS, localizedPath, type SupportedLocale } from "@/lib/i18n";

const stepIcons = [Search, Target, UserRoundSearch];

const localizedChrome = {
  es: { shortCta: "Probar", product: "Producto", privacy: "Privacidad", terms: "Términos", contact: "Contacto", note: "Captación de clientes para freelancers y pequeñas agencias." },
  fr: { shortCta: "Essayer", product: "Produit", privacy: "Confidentialité", terms: "Conditions", contact: "Contact", note: "Prospection client pour freelances et petites agences." },
  it: { shortCta: "Prova", product: "Prodotto", privacy: "Privacy", terms: "Termini", contact: "Contatti", note: "Acquisizione clienti per freelance e piccole agenzie." },
};

export default function LocalizedMarketingPage({ locale, pageKey }: { locale: SupportedLocale; pageKey: LocalizedPageKey }) {
  const page = localizedMarketing[locale][pageKey];
  const chrome = localizedChrome[locale];
  const signupHref = `/auth?mode=signup&intent=localized-${pageKey}&source=${locale}-landing`;
  const secondaryPath = pageKey === "home" ? "/lead-generation/web-design-leads" : "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: `https://icloseleads.com${localizedPath(locale, page.path)}`,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", name: "iCloseLeads", url: "https://icloseleads.com" },
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <div className="marketing-shell min-h-screen overflow-x-hidden bg-background text-foreground" lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="md" href={localizedPath(locale, "")} />
          <nav className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground md:flex" aria-label={`${LOCALE_LABELS[locale]} navigation`}>
            <Link href={localizedPath(locale, "")} className="hover:text-foreground">iCloseLeads</Link>
            <Link href={localizedPath(locale, "/lead-generation/web-design-leads")} className="hover:text-foreground">Web design leads</Link>
            <Link href={localizedPath(locale, "/blog/freelance-client-acquisition-system")} className="hover:text-foreground">Client acquisition</Link>
          </nav>
          <Link href={signupHref} prefetch={false} className="marketing-primary-cta whitespace-nowrap" aria-label={page.primaryCta}>
            <span className="sm:hidden">{chrome.shortCta}</span>
            <span className="hidden sm:inline">{page.primaryCta}</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-border bg-surface/35">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight text-foreground sm:text-6xl">{page.heading}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{page.intro}</p>
            <div className="mx-auto mt-7 max-w-3xl rounded-lg border border-primary/25 bg-primary/10 p-5 text-left">
              <p className="text-base leading-7 text-foreground">{page.directAnswer}</p>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={signupHref} prefetch={false} className="marketing-primary-cta">
                {page.primaryCta}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={localizedPath(locale, secondaryPath)} className="marketing-secondary-cta">{page.secondaryCta}</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">{page.benefitsTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {page.benefits.map(item => (
              <article key={item.title} className="rounded-lg border border-border bg-card p-6">
                <CheckCircle2 className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface/45">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{page.stepsTitle}</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {page.steps.map((item, index) => {
                const Icon = stepIcons[index] ?? Search;
                return (
                  <div key={item.title} className="min-w-0">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-light"><Icon className="h-5 w-5" /></span>
                    <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{page.faqTitle}</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {page.faqs.map(item => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-foreground marker:hidden">{item.question}</summary>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-background" aria-label="Site footer">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <Logo size="md" href={localizedPath(locale, "")} />
            <p className="mt-3 text-sm text-muted-foreground">{chrome.note}</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-muted-foreground" aria-label={`${LOCALE_LABELS[locale]} footer`}>
            <Link href={localizedPath(locale, "")} className="hover:text-foreground">{chrome.product}</Link>
            <Link href="/privacy" className="hover:text-foreground">{chrome.privacy}</Link>
            <Link href="/terms" className="hover:text-foreground">{chrome.terms}</Link>
            <Link href="/contact" className="hover:text-foreground">{chrome.contact}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
