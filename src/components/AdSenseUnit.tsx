"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, never>>;
  }
}

const AD_CLIENT = "ca-pub-7576940446912367";
const ADSENSE_SCRIPT_ID = "google-adsense-script";
const EMPTY_AD_COLLAPSE_DELAY_MS = 6500;

function loadAdSense() {
  if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
  document.head.appendChild(script);
}

function adIsFilled(ad: HTMLModElement | null) {
  return ad?.dataset.adStatus === "filled";
}

function adIsUnfilled(ad: HTMLModElement | null) {
  return ad?.dataset.adStatus === "unfilled";
}

type AdSenseUnitProps = {
  slot: string;
  format: "auto" | "fluid";
  layoutKey?: string;
  fullWidthResponsive?: boolean;
  className?: string;
};

function AdSenseUnit({
  slot,
  format,
  layoutKey,
  fullWidthResponsive = false,
  className = "",
}: AdSenseUnitProps) {
  const containerRef = useRef<HTMLElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    let visibilityObserver: IntersectionObserver | undefined;
    let statusObserver: MutationObserver | undefined;
    let collapseTimer: number | undefined;

    const clearCollapseTimer = () => {
      if (!collapseTimer) return;
      window.clearTimeout(collapseTimer);
      collapseTimer = undefined;
    };

    const inspectAdStatus = () => {
      if (adIsFilled(adRef.current)) {
        setIsFilled(true);
        clearCollapseTimer();
        return;
      }

      if (adIsUnfilled(adRef.current)) {
        setIsCollapsed(true);
      }
    };

    const watchAdStatus = () => {
      inspectAdStatus();

      if ("MutationObserver" in window && adRef.current) {
        statusObserver = new MutationObserver(inspectAdStatus);
        statusObserver.observe(adRef.current, {
          attributes: true,
          attributeFilter: ["data-ad-status"],
          childList: true,
          subtree: true,
        });
      }

      collapseTimer = window.setTimeout(() => {
        if (!adIsFilled(adRef.current)) {
          setIsCollapsed(true);
        }
      }, EMPTY_AD_COLLAPSE_DELAY_MS);
    };

    const initialize = () => {
      if (initialized.current) return;

      if (adRef.current?.dataset.adsbygoogleStatus) {
        initialized.current = true;
        watchAdStatus();
        return;
      }

      initialized.current = true;
      loadAdSense();
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("AdSense unit could not initialize", error);
        }
      }
      watchAdStatus();
    };

    if (!("IntersectionObserver" in window) || !containerRef.current) {
      initialize();
    } else {
      visibilityObserver = new IntersectionObserver(
        entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          visibilityObserver?.disconnect();
          initialize();
        },
        { rootMargin: "600px 0px" }
      );

      visibilityObserver.observe(containerRef.current);
    }

    return () => {
      visibilityObserver?.disconnect();
      statusObserver?.disconnect();
      clearCollapseTimer();
    };
  }, []);

  if (isCollapsed) return null;

  return (
    <aside ref={containerRef} aria-label="Advertisement" className={`min-w-0 ${className}`}>
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Advertisement
      </p>
      <div className="min-h-[96px] min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card/70 p-2 sm:min-h-[128px] sm:p-3">
        <ins
          ref={adRef}
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive={fullWidthResponsive ? "true" : undefined}
          className={`adsbygoogle transition-opacity duration-200 ${isFilled ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </aside>
  );
}

export function MarketingAdBand({ className = "" }: { className?: string }) {
  return (
    <section className={`border-y border-border bg-surface/25 px-4 py-10 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <AdSenseUnit slot="1080749546" format="auto" fullWidthResponsive />
      </div>
    </section>
  );
}

export function BlogInlineAd({ className = "" }: { className?: string }) {
  return (
    <AdSenseUnit
      slot="1080749546"
      format="auto"
      fullWidthResponsive
      className={`my-10 ${className}`}
    />
  );
}

const PUBLIC_AD_PATHS = new Set([
  "/about",
  "/affiliate",
  "/blog",
  "/careers",
  "/changelog",
  "/features",
  "/lead-generation",
  "/press",
  "/pricing",
  "/resources",
  "/use-cases",
]);

const PUBLIC_AD_PREFIXES = [
  "/features/",
  "/for/",
  "/lead-generation/",
  "/resources/",
  "/tools/",
  "/use-cases/",
];

export function PublicFooterAd() {
  const pathname = usePathname();
  const isBlogPost = pathname.startsWith("/blog/");
  const isEligible = PUBLIC_AD_PATHS.has(pathname)
    || PUBLIC_AD_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (!isEligible || isBlogPost) return null;

  return <MarketingAdBand className="border-b-0" />;
}

export function LeadResultsAd() {
  const [viewport, setViewport] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    setViewport(window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");
  }, []);

  if (!viewport) return null;

  return viewport === "mobile" ? (
    <AdSenseUnit
      slot="9482129532"
      format="fluid"
      layoutKey="-6c+e7+1e-40+6x"
      className="my-7"
    />
  ) : (
    <AdSenseUnit
      slot="1014084754"
      format="fluid"
      layoutKey="-ex+5g+64-d5+3t"
      className="my-7"
    />
  );
}

export function DashboardBottomAd() {
  return (
    <AdSenseUnit
      slot="1080749546"
      format="auto"
      fullWidthResponsive
      className="mt-8"
    />
  );
}
