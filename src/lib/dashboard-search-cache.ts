import { sanitizeLegacyJobDomain } from "./job-data";

export const DASHBOARD_SEARCH_CACHE_VERSION = "10";

export const DASHBOARD_SEARCH_CACHE_KEYS = {
  live: "ff_ss_live_results",
  local: "ff_ss_local_results",
  remote: "ff_ss_remote_results",
} as const;

const VERSION_KEY = "icl_cache_v";

export function prepareDashboardSearchCache(storage: Storage) {
  if (storage.getItem(VERSION_KEY) === DASHBOARD_SEARCH_CACHE_VERSION) return;

  if (storage.getItem(VERSION_KEY) === "9") {
    for (const key of [DASHBOARD_SEARCH_CACHE_KEYS.remote, DASHBOARD_SEARCH_CACHE_KEYS.live]) {
      try {
        const cached = JSON.parse(storage.getItem(key) || "null");
        if (Array.isArray(cached?.leads)) {
          cached.leads = cached.leads.map((lead: { company: string; domain: string; source?: string }) => sanitizeLegacyJobDomain(lead));
          storage.setItem(key, JSON.stringify(cached));
        }
      } catch { storage.removeItem(key); }
    }
    storage.setItem(VERSION_KEY, DASHBOARD_SEARCH_CACHE_VERSION);
    return;
  }

  Object.values(DASHBOARD_SEARCH_CACHE_KEYS).forEach(key => storage.removeItem(key));
  storage.setItem(VERSION_KEY, DASHBOARD_SEARCH_CACHE_VERSION);
}
