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
const EMPTY_AD_COLLAPSE_DELAY_MS = 4500;
const DISPLAY_AD_SLOT = "1080749546";
const DESKTOP_IN_FEED_AD = {
  slot: "1014084754",
  format: "fluid" as const,
  layoutKey: "-ex+5g+64-d5+3t",
};
const MOBILE_IN_FEED_AD = {
  slot: "9482129532",
  format: "fluid" as const,
  layoutKey: "-6c+e7+1e-40+6x",
};

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

function adShouldCollapseAfterDelay(ad: HTMLModElement | null) {
  if (!ad || adIsUnfilled(ad)) return true;
  if (adIsFilled(ad)) return false;

  const iframe = ad.querySelector("iframe");
  if (!iframe) return true;

  return iframe.clientWidth === 0 || iframe.clientHeight === 0;
}

type AdSenseUnitProps = {
  slot: string;
  format: "auto" | "fluid";
  layoutKey?: string;
  fullWidthResponsive?: boolean;
  className?: string;
  shell?: "display" | "native";
};

function AdSenseUnit({
  slot,
  format,
  layoutKey,
  fullWidthResponsive = false,
  className = "",
  shell = "display",
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
        clearCollapseTimer();
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
        if (adShouldCollapseAfterDelay(adRef.current)) {
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

  const shellClass = shell === "native"
    ? "min-h-[84px] min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card/55 p-2.5 sm:min-h-[112px] sm:p-3"
    : "min-h-[96px] min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card/70 p-2 sm:min-h-[128px] sm:p-3";

  return (
    <aside ref={containerRef} aria-label="Advertisement" className={`min-w-0 ${className}`}>
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Advertisement
      </p>
      <div className={shellClass}>
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

function useAdViewport() {
  const [viewport, setViewport] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      setViewport("desktop");
      return;
    }

    const query = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setViewport(query.matches ? "mobile" : "desktop");

    updateViewport();
    query.addEventListener?.("change", updateViewport);

    return () => {
      query.removeEventListener?.("change", updateViewport);
    };
  }, []);

  return viewport;
}

function ResponsiveNativeAd({ className = "" }: { className?: string }) {
  const viewport = useAdViewport();

  if (!viewport) return null;

  const ad = viewport === "mobile" ? MOBILE_IN_FEED_AD : DESKTOP_IN_FEED_AD;

  return (
    <AdSenseUnit
      key={`native-${viewport}`}
      {...ad}
      shell="native"
      className={className}
    />
  );
}

function ResponsiveMarketingAd({ className = "" }: { className?: string }) {
  const viewport = useAdViewport();

  if (!viewport) return null;

  if (viewport === "mobile") {
    return <ResponsiveNativeAd className={className} />;
  }

  return (
    <AdSenseUnit
      slot={DISPLAY_AD_SLOT}
      format="auto"
      fullWidthResponsive
      className={className}
    />
  );
}

export function MarketingAdBand({ className = "" }: { className?: string }) {
  return (
    <section className={`border-y border-border bg-surface/25 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <ResponsiveNativeAd />
      </div>
    </section>
  );
}

export function BlogInlineAd({ className = "" }: { className?: string }) {
  return <ResponsiveNativeAd className={`my-8 sm:my-10 ${className}`} />;
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
  const viewport = useAdViewport();

  if (!viewport) return null;

  const ad = viewport === "mobile" ? MOBILE_IN_FEED_AD : DESKTOP_IN_FEED_AD;

  return (
    <AdSenseUnit
      key={`lead-results-${viewport}`}
      {...ad}
      shell="native"
      className="my-7"
    />
  );
}

export function DashboardBottomAd() {
  return <ResponsiveMarketingAd className="mt-8" />;
}
