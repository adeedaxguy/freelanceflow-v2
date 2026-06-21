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
      if (!saved) setVisible(true);
    } catch { /* localStorage not available */ }
  }, []);

  const accept = (all: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, all ? "all" : "necessary");
    } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary-light" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm mb-0.5">We use cookies</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We use cookies to improve your experience and analyse site usage. By clicking &quot;Accept All&quot; you consent to our use of cookies.{" "}
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => accept(false)}
              className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-all hover:border-border/80"
            >
              Necessary Only
            </button>
            <button
              onClick={() => accept(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg transition-colors"
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
