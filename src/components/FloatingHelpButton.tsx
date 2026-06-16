"use client";

/**
 * FloatingHelpButton — a persistent bottom-right "?" button.
 *
 * Clicking it dispatches a custom event that OnboardingTour listens for,
 * so the tour restarts without a page reload.
 */

import { useState, useRef, useEffect } from "react";
import { HelpCircle, BookOpen, MessageCircle, X, RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

const QUICK_LINKS = [
  { label: "Restart platform tour",    icon: RotateCcw,      action: "tour"     },
  { label: "Visit support center",     icon: MessageCircle,  action: "support"  },
  { label: "Read docs & guides",       icon: BookOpen,        action: "docs"     },
] as const;

export default function FloatingHelpButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAction = (action: string) => {
    setOpen(false);
    if (action === "tour") {
      // Tell OnboardingTour to restart
      localStorage.removeItem("ff_tour_done_v1");
      window.dispatchEvent(new CustomEvent("ff:restart-tour"));
    }
  };

  return (
    <div ref={ref} className="fixed bottom-[88px] right-4 sm:right-6 z-[150] flex flex-col items-end gap-2">

      {/* ── Popup menu ──────────────────────────────────────────────────────── */}
      {open && (
        <div className="mb-1 w-56 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold text-foreground">Help & Resources</span>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="p-2 space-y-0.5">
            {QUICK_LINKS.map(({ label, icon: Icon, action }) => {
              if (action === "support") {
                return (
                  <Link
                    key={action}
                    href="/dashboard/support"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-primary-light" />
                    {label}
                  </Link>
                );
              }
              if (action === "docs") {
                return (
                  <a
                    key={action}
                    href="https://docs.icloseleads.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-primary-light" />
                    {label}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
                  </a>
                );
              }
              return (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-left"
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-accent" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-white/[0.02]">
            <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
              iCloseLeads v2 · Built with ❤️ by a team of developers
            </p>
          </div>
        </div>
      )}

      {/* ── Trigger button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Help & Resources"
        title="Help & Resources"
        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200
          ${open
            ? "bg-primary text-white shadow-glow-primary rotate-[15deg]"
            : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-glow-primary/30"
          }`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
