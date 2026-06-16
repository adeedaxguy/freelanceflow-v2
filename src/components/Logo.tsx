import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

/**
 * iCloseLeads — Premium brand mark
 *
 * The icon: a hexagonal shield with a bold ">" arrow cut-out,
 * symbolising closing deals and forward momentum.
 * Gradient: deep violet → electric cyan (matches the app's primary palette).
 *
 * Wordmark: "i" + "Close" + "Leads" with the "i" and "Leads"
 * in the gradient colour so the eye reads "iClose · Leads" as two ideas.
 */
export default function Logo({
  size      = "md",
  showText  = true,
  href      = "/",
  className,
}: LogoProps) {
  const iconSize  = { sm: "w-7 h-7",   md: "w-9 h-9",   lg: "w-12 h-12"  }[size];
  const textSize  = { sm: "text-base", md: "text-lg",   lg: "text-2xl"   }[size];

  // ── Icon mark ────────────────────────────────────────────────────────────────
  const mark = (
    <div className={cn("relative flex-shrink-0", iconSize)}>
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-xl bg-violet-600/40 blur-md scale-110 pointer-events-none" />

      {/* Shield container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg shadow-violet-900/40">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            {/* Main brand gradient */}
            <linearGradient id="icl-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#6D28D9" />
              <stop offset="55%"  stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            {/* Top-left shine */}
            <linearGradient id="icl-shine" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"    />
            </linearGradient>
          </defs>

          {/* Background fill */}
          <rect width="40" height="40" fill="url(#icl-bg)" />

          {/* Subtle shine overlay */}
          <rect width="40" height="40" fill="url(#icl-shine)" />

          {/* Subtle grid texture */}
          <path
            d="M0 13.3h40M0 26.7h40M13.3 0v40M26.7 0v40"
            stroke="white" strokeOpacity="0.06" strokeWidth="0.6"
          />

          {/*
            ">" chevron / closing-bracket mark — bold, geometric, memorable.
            Reads as: "close the deal", forward movement, a cursor/pointer.
          */}
          <path
            d="M13 10 L26 20 L13 30"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Small dot to the left of the chevron — the "i" dot metaphor */}
          <circle cx="9" cy="20" r="2.5" fill="white" fillOpacity="0.85" />
        </svg>
      </div>
    </div>
  );

  // ── Wordmark ─────────────────────────────────────────────────────────────────
  const wordmark = (
    <span
      className={cn(
        "font-extrabold tracking-tight leading-none select-none",
        textSize,
      )}
    >
      {/* "i" — accent colour */}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
        i
      </span>
      {/* "Close" — foreground */}
      <span className="text-foreground">Close</span>
      {/* "Leads" — accent colour */}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
        Leads
      </span>
    </span>
  );

  // ── Composed ─────────────────────────────────────────────────────────────────
  const inner = (
    <span className={cn("flex items-center gap-2.5 group", className)}>
      {mark}
      {showText && wordmark}
    </span>
  );

  return href ? (
    <Link
      href={href}
      className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-xl"
    >
      {inner}
    </Link>
  ) : inner;
}
