"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const DEFAULT_MEASUREMENT_ID = "G-WRSW1WG2DY";
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? DEFAULT_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function GoogleAnalyticsPageTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didTrackInitialRoute = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    if (!didTrackInitialRoute.current) {
      didTrackInitialRoute.current = true;
      return;
    }

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag?.("event", "page_view", {
      page_title: document.title,
      page_path: pagePath,
      page_location: window.location.href,
      send_to: measurementId,
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID || window.gtag) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { send_page_view: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }, []);

  if (!MEASUREMENT_ID) return null;

  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageTracker measurementId={MEASUREMENT_ID} />
    </Suspense>
  );
}
