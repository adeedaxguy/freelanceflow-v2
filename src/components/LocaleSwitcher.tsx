"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe2, X } from "lucide-react";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  localizedEquivalent,
  type SupportedLocale,
} from "@/lib/i18n";

const PRIVATE_PREFIXES = ["/dashboard", "/admin", "/auth", "/api", "/checkout", "/site-preview"];
const STORAGE_KEY = "icloseleads_locale";

function currentLocale(pathname: string): "en" | SupportedLocale {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  return isSupportedLocale(segment) ? segment : "en";
}

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const locale = currentLocale(pathname);
  const [open, setOpen] = useState(false);
  const [suggested, setSuggested] = useState<SupportedLocale | null>(null);

  const hidden = PRIVATE_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const options = useMemo(() => ["en", ...SUPPORTED_LOCALES] as const, []);

  useEffect(() => {
    if (hidden || locale !== "en") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const browserLocale = navigator.language.toLowerCase().split("-")[0] ?? "";
    const candidate = isSupportedLocale(saved ?? "")
      ? saved as SupportedLocale
      : isSupportedLocale(browserLocale)
        ? browserLocale
        : null;
    if (candidate) setSuggested(candidate);
  }, [hidden, locale]);

  if (hidden) return null;

  function saveLocale(nextLocale: "en" | SupportedLocale) {
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    document.cookie = `site_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    setSuggested(null);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {suggested && (
        <div className="locale-suggestion max-w-sm rounded-lg border border-border bg-card p-3 shadow-card" role="status">
          <div className="flex items-start gap-3">
            <Globe2 className="mt-0.5 h-5 w-5 flex-none text-primary-light" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Prefer {LOCALE_LABELS[suggested]}?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={localizedEquivalent(pathname, suggested)}
                  onClick={() => saveLocale(suggested)}
                  className="rounded-md bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
                >
                  Open {LOCALE_LABELS[suggested]}
                </Link>
                <button
                  type="button"
                  onClick={() => setSuggested(null)}
                  className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Keep English
                </button>
              </div>
            </div>
            <button type="button" onClick={() => setSuggested(null)} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Dismiss language suggestion">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className="w-52 overflow-hidden rounded-lg border border-border bg-card p-1.5 shadow-card" role="menu" aria-label="Choose language">
          {options.map(option => (
            <Link
              key={option}
              href={localizedEquivalent(pathname, option)}
              onClick={() => saveLocale(option)}
              className="flex min-h-11 items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              role="menuitem"
              hrefLang={option}
              lang={option}
            >
              {LOCALE_LABELS[option]}
              {locale === option && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="locale-toggle inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-bold text-foreground shadow-card transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Language: ${LOCALE_LABELS[locale]}`}
      >
        <Globe2 className="h-4 w-4 text-primary-light" aria-hidden="true" />
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        <ChevronDown className={`hidden h-4 w-4 transition-transform sm:block ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
    </div>
  );
}
