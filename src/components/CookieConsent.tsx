"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

const STORAGE_KEY = "ff_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return;

      const mobileQuery = window.matchMedia("(max-width: 639px)");
      if (!mobileQuery.matches) {
        setVisible(true);
        return;
      }

      const showAfterHero = () => {
        if (window.scrollY > 420) {
          setVisible(true);
          window.removeEventListener("scroll", showAfterHero);
        }
      };

      showAfterHero();
      window.addEventListener("scroll", showAfterHero, { passive: true });
      return () => window.removeEventListener("scroll", showAfterHero);
    } catch { /* localStorage not available */ }
    return undefined;
  }, []);

  const accept = (all: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, all ? "all" : "necessary");
    } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Icon */}
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary-light" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm mb-0.5">We use cookies</p>
            <p className="text-[11px] sm:text-xs leading-snug sm:leading-relaxed text-muted-foreground">
              We use cookies to improve your experience and analyse usage.{" "}
              <Link href="/cookie-policy" className="text-primary-light underline underline-offset-2 hover:no-underline">
                Cookie Policy
              </Link>
              {" · "}
              <Link href="/privacy" className="text-primary-light underline underline-offset-2 hover:no-underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full items-center gap-2 sm:w-auto flex-shrink-0">
            <button
              onClick={() => accept(false)}
              className="flex-1 sm:flex-none px-3 py-2 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-all hover:border-border/80"
            >
              Necessary Only
            </button>
            <button
              onClick={() => accept(true)}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-light text-white text-[11px] sm:text-xs font-semibold rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Accept All
            </button>
            <button
              onClick={() => accept(false)}
              aria-label="Dismiss"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
