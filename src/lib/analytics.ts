export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackAnalyticsEvent(name: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
