"use client";

/**
 * OnboardingTour — spotlight-based step-by-step guide for new users.
 *
 * • Stores completion in localStorage (no DB needed).
 * • Each step highlights a visible dashboard control on desktop or mobile.
 * • Full-screen dark overlay with a "cut-out" spotlight using box-shadow.
 * • Tooltip positioned to the right of the spotlight on desktop,
 *   below it on mobile.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Search, GitMerge, Mail, CalendarDays, ArrowRight,
  X, ChevronLeft, CheckCircle,
} from "lucide-react";

const STORAGE_KEY = "ff_tour_done_v1";

// ─── Step definitions ─────────────────────────────────────────────────────────
interface TourStep {
  id:          string;
  icon:        React.ElementType;
  iconColor:   string;
  title:       string;
  body:        string;
  mobileBody?: string;
  /** CSS selector of the desktop element to spotlight */
  selector?:   string;
  /** CSS selector of the mobile element to spotlight */
  mobileSelector?: string;
  /** Navigate to this page when the step activates */
  href?:       string;
  /** CTA label for the primary button */
  cta?:        string;
}

const STEPS: TourStep[] = [
  {
    id:        "welcome",
    icon:      Zap,
    iconColor: "text-accent",
    title:     "Welcome to iCloseLeads 👋",
    body:      "Let's take a quick 60-second tour so you know exactly where everything is. You can skip at any time.",
    mobileBody: "Let's take a quick 60-second tour of the mobile dashboard so you know where the lead engines, saved leads, and AI tools live.",
    cta:       "Let's go →",
  },
  {
    id:        "email",
    icon:      Mail,
    iconColor: "text-blue-400",
    title:     "Step 1 — Understand Gmail prepare mode",
    body:      "No email connection is required. iCloseLeads prepares each proposal in Gmail compose so you can review it and click Send manually from your own inbox.",
    mobileBody: "No email connection is required. Use the More menu for setup and outreach tools; proposals open as prepared Gmail drafts so you stay in control.",
    selector:  'a[href="/dashboard/email-settings"]',
    mobileSelector: '[data-tour="mobile-more"]',
    href:      "/dashboard/email-settings",
    cta:       "View setup →",
  },
  {
    id:        "leads",
    icon:      Search,
    iconColor: "text-primary-light",
    title:     "Step 2 — Find your first leads",
    body:      "Pick your niche, hit Search, and iCloseLeads pulls live opportunities from multiple lead channels. Each lead is scored by how well it matches your niche — filter by score to focus only on the best fits.",
    mobileBody: "Tap Jobs to find remote opportunities matched to your niche. Your saved leads and AI proposal workflow stay connected as you move.",
    selector:  'a[href="/dashboard/leads"]',
    mobileSelector: '[data-tour="mobile-jobs"]',
    href:      "/dashboard/leads",
    cta:       "Find leads →",
  },
  {
    id:        "pipeline",
    icon:      GitMerge,
    iconColor: "text-accent",
    title:     "Step 3 — Track deals in your pipeline",
    body:      "Save leads and drag them through stages: New → Contacted → Replied → Negotiating → Won. You always see exactly where each deal stands at a glance.",
    mobileBody: "Use More to open CRM Pipeline. Save good leads, then move them from New to Contacted, Replied, Negotiating, and Won.",
    selector:  'a[href="/dashboard/pipeline"]',
    mobileSelector: '[data-tour="mobile-more"]',
    href:      "/dashboard/pipeline",
    cta:       "View pipeline →",
  },
  {
    id:        "dealsclose",
    icon:      Zap,
    iconColor: "text-yellow-400",
    title:     "Step 4 — Close deals with AI",
    body:      "When a prospect replies, paste their message into AI Deal Closer. The AI detects their intent (price objection, timing issue, ready to buy…) and writes the perfect reply to move the deal forward.",
    mobileBody: "AI Deal Closer lives under More on mobile. Paste a prospect reply and get a clear next message without leaving the dashboard.",
    selector:  'a[href="/dashboard/deal-closer"]',
    mobileSelector: '[data-tour="mobile-more"]',
    href:      "/dashboard/deal-closer",
    cta:       "Try it →",
  },
  {
    id:        "followups",
    icon:      CalendarDays,
    iconColor: "text-orange-400",
    title:     "Step 5 — Plan follow-ups",
    body:      "Most deals close on the 3rd or 4th touchpoint. Build a multi-step follow-up plan, then prepare each message in Gmail when it is time to reach out.",
    mobileBody: "Follow-ups also live under More. Build your sequence, prepare each Gmail draft, and keep outreach moving without sending anything automatically.",
    selector:  'a[href="/dashboard/followups"]',
    mobileSelector: '[data-tour="mobile-more"]',
    href:      "/dashboard/followups",
    cta:       "Plan follow-ups →",
  },
  {
    id:        "done",
    icon:      CheckCircle,
    iconColor: "text-green-400",
    title:     "You're all set! 🎉",
    body:      "That's the full loop: find leads → prepare AI proposals in Gmail → close with AI → plan follow-ups. Go find your first lead and prepare your first proposal.",
    mobileBody: "That's the mobile loop: Jobs for remote leads, Live for fresh hiring signals, Saved for follow-up, and More for the full toolkit.",
    cta:       "Start finding leads →",
    href:      "/dashboard/leads",
  },
];

// ─── Spotlight rect ───────────────────────────────────────────────────────────
interface Rect { x: number; y: number; w: number; h: number }

function getRect(selector: string): Rect | null {
  const elements = Array.from(document.querySelectorAll(selector));
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  return null;
}

function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (!a || !b) return a === b;
  return (
    Math.abs(a.x - b.x) < 0.5 &&
    Math.abs(a.y - b.y) < 0.5 &&
    Math.abs(a.w - b.w) < 0.5 &&
    Math.abs(a.h - b.h) < 0.5
  );
}

// ─── Tooltip position ─────────────────────────────────────────────────────────
// Returns CSS left/top for the tooltip card, given the spotlight rect
function tooltipPos(rect: Rect | null, cardW = 340, cardH = 260) {
  const pad = 16;
  const vw  = window.innerWidth;
  const vh  = window.innerHeight;
  const width = Math.min(cardW, Math.max(280, vw - pad * 2));

  if (!rect) {
    return {
      left: `${Math.max(pad, (vw - width) / 2)}px`,
      top: `${Math.max(pad, Math.min((vh - cardH) / 2, vh - cardH - pad))}px`,
      transform: "none",
    };
  }

  if (vw < 1024) {
    const left = Math.max(pad, Math.min(rect.x + rect.w / 2 - width / 2, vw - width - pad));
    const hasRoomAbove = rect.y - cardH - pad > pad;
    const top = hasRoomAbove
      ? Math.max(pad, rect.y - cardH - pad)
      : Math.min(vh - cardH - pad, rect.y + rect.h + pad);
    return {
      left: `${left}px`,
      top: `${Math.max(pad, top)}px`,
      transform: "none",
    };
  }

  // Prefer right of spotlight
  if (rect.x + rect.w + pad + width < vw) {
    return {
      left:  `${rect.x + rect.w + pad}px`,
      top:   `${Math.max(pad, Math.min(rect.y, vh - cardH - pad))}px`,
      transform: "none",
    };
  }
  // Below
  if (rect.y + rect.h + pad + cardH < vh) {
    return {
      left:  `${Math.max(pad, Math.min(rect.x, vw - width - pad))}px`,
      top:   `${rect.y + rect.h + pad}px`,
      transform: "none",
    };
  }
  // Above
  return {
    left:  `${Math.max(pad, Math.min(rect.x, vw - width - pad))}px`,
    top:   `${Math.max(pad, rect.y - cardH - pad)}px`,
    transform: "none",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingTour() {
  const router = useRouter();
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect,    setRect]    = useState<Rect | null>(null);
  const [mobile,  setMobile]  = useState(false);
  const rafRef                = useRef<number>(0);

  // Keep the tour aligned with the active dashboard navigation pattern.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Show tour only for users who haven't completed it
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Small delay so the sidebar renders first
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Listen for the FloatingHelpButton restart event
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setRect(null);
      setVisible(true);
    };
    window.addEventListener("ff:restart-tour", handler);
    return () => window.removeEventListener("ff:restart-tour", handler);
  }, []);

  // Track spotlight element position (runs on every animation frame so it
  // stays in sync even if the sidebar animates in)
  const updateRect = useCallback(() => {
    const s = STEPS[step];
    const selector = mobile && s?.mobileSelector ? s.mobileSelector : s?.selector;
    const nextRect = selector ? getRect(selector) : null;
    setRect(prev => sameRect(prev, nextRect) ? prev : nextRect);
  }, [mobile, step]);

  useEffect(() => {
    if (!visible) return;
    updateRect();
    const tick = () => { updateRect(); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, updateRect]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
    cancelAnimationFrame(rafRef.current);
  };

  const next = () => {
    const s = STEPS[step];
    // Navigate if step specifies a href (last step CTA)
    if (step === STEPS.length - 1) {
      dismiss();
      if (s?.href) router.push(s.href);
      return;
    }
    const nextStep = STEPS[step + 1];
    if (nextStep?.href) router.push(nextStep.href);
    setStep(step + 1);
  };

  const back = () => {
    if (step === 0) return;
    const prevStep = STEPS[step - 1];
    if (prevStep?.href) router.push(prevStep.href);
    setStep(step - 1);
  };

  if (!visible) return null;

  const current = STEPS[step]!;
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast  = step === STEPS.length - 1;
  const currentBody = mobile && current.mobileBody ? current.mobileBody : current.body;
  const tip     = tooltipPos(rect, 340, mobile ? 320 : 260);

  const PADDING = 10; // px around spotlight rect

  return (
    <>
      {/* ── Dark overlay ──────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none transition-all duration-300"
        style={{ background: rect ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.75)" }}
      />

      {/* ── Spotlight hole (box-shadow trick) ─────────────────────────────── */}
      {rect && (
        <div
          className="fixed z-[201] pointer-events-none"
          style={{
            left:         rect.x - PADDING,
            top:          rect.y - PADDING,
            width:        rect.w + PADDING * 2,
            height:       rect.h + PADDING * 2,
            borderRadius: 14,
            boxShadow:    "0 0 0 9999px rgba(0,0,0,0.78)",
            outline:      "2px solid rgba(124,58,237,0.6)",
            outlineOffset: 2,
          }}
        />
      )}

      {/* ── Tooltip card ─────────────────────────────────────────────────── */}
      <div
        className="fixed z-[202] w-[calc(100vw-32px)] max-w-[340px] max-h-[calc(100vh-32px)] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4"
        style={tip}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon className={`w-5 h-5 ${current.iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {isFirst ? "Welcome" : isLast ? "Done" : `Step ${step} of ${STEPS.length - 2}`}
              </p>
              <h3 className="text-foreground font-bold text-sm leading-tight">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex-shrink-0"
            aria-label="Skip tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-muted-foreground text-sm leading-relaxed">{currentBody}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {!isFirst && (
            <button
              onClick={back}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-xl hover:border-primary/30 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-hero text-white font-bold text-sm shadow-glow-primary hover:opacity-90 transition-all"
          >
            {current.cta ?? "Next"}
            {!isLast && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Skip link */}
        {!isLast && (
          <p className="text-center">
            <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
              Skip tour
            </button>
          </p>
        )}
      </div>
    </>
  );
}
