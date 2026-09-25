export const SUPPORTED_LOCALES = ["es", "fr", "it"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<"en" | SupportedLocale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
};

export const LOCALIZED_PATHS = [
  "",
  "/lead-generation/web-design-leads",
  "/blog/freelance-client-acquisition-system",
] as const;

export type LocalizedPath = (typeof LOCALIZED_PATHS)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function localizedPath(locale: "en" | SupportedLocale, path: string) {
  const normalized = path === "/" ? "" : path.replace(/\/$/, "");
  return locale === "en" ? normalized || "/" : `/${locale}${normalized}`;
}

export function localeAlternates(path: LocalizedPath) {
  const base = "https://icloseleads.com";
  return {
    "x-default": `${base}${localizedPath("en", path)}`,
    en: `${base}${localizedPath("en", path)}`,
    es: `${base}${localizedPath("es", path)}`,
    fr: `${base}${localizedPath("fr", path)}`,
    it: `${base}${localizedPath("it", path)}`,
  };
}

export function localizedEquivalent(pathname: string, locale: "en" | SupportedLocale) {
  const withoutLocale = pathname.replace(/^\/(es|fr|it)(?=\/|$)/, "") || "/";
  const normalized = withoutLocale === "/" ? "" : withoutLocale.replace(/\/$/, "");
  const path = LOCALIZED_PATHS.includes(normalized as LocalizedPath) ? normalized : "";
  return localizedPath(locale, path);
}
