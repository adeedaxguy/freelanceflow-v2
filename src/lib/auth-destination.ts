export function getAuthDestination(callback: string | null, plan: string, fallback: string) {
  if (callback) {
    try {
      const url = new URL(callback, "https://icloseleads.com");
      if (url.origin === "https://icloseleads.com" && (url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/"))) {
        return url.pathname + url.search;
      }
    } catch { /* Invalid or external return paths must not control sign-in navigation. */ }
  }
  if (plan === "pro" || plan === "agency") return `/dashboard/upgrade?plan=${plan}`;
  return fallback;
}
