import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalizedMarketingPage from "@/components/LocalizedMarketingPage";
import { localizedMarketing, type LocalizedPageKey } from "@/data/localized-marketing";
import {
  LOCALIZED_PATHS,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  localeAlternates,
  localizedPath,
  type LocalizedPath,
} from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug?: string[] }> };

const pageKeyByPath: Record<LocalizedPath, LocalizedPageKey> = {
  "": "home",
  "/lead-generation/web-design-leads": "web-design-leads",
  "/blog/freelance-client-acquisition-system": "client-acquisition-system",
};

function resolve(params: { locale: string; slug?: string[] }) {
  if (!isSupportedLocale(params.locale)) return null;
  const path = params.slug?.length ? `/${params.slug.join("/")}` : "";
  if (!LOCALIZED_PATHS.includes(path as LocalizedPath)) return null;
  return { locale: params.locale, path: path as LocalizedPath, pageKey: pageKeyByPath[path as LocalizedPath] };
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap(locale => LOCALIZED_PATHS.map(path => ({
    locale,
    slug: path ? path.slice(1).split("/") : [],
  })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = resolve(await params);
  if (!resolved) return {};
  const page = localizedMarketing[resolved.locale][resolved.pageKey];
  const canonical = `https://icloseleads.com${localizedPath(resolved.locale, resolved.path)}`;
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical, languages: localeAlternates(resolved.path) },
    openGraph: {
      type: resolved.pageKey === "client-acquisition-system" ? "article" : "website",
      locale: resolved.locale,
      url: canonical,
      siteName: "iCloseLeads",
      title: page.title,
      description: page.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iCloseLeads" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocalizedPage({ params }: Props) {
  const resolved = resolve(await params);
  if (!resolved) notFound();
  return <LocalizedMarketingPage locale={resolved.locale} pageKey={resolved.pageKey} />;
}
