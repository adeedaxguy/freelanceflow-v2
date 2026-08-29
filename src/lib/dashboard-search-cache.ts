export const DASHBOARD_SEARCH_CACHE_VERSION = "9";

export const DASHBOARD_SEARCH_CACHE_KEYS = {
  live: "ff_ss_live_results",
  local: "ff_ss_local_results",
  remote: "ff_ss_remote_results",
} as const;

const VERSION_KEY = "icl_cache_v";

export function prepareDashboardSearchCache(storage: Storage) {
  if (storage.getItem(VERSION_KEY) === DASHBOARD_SEARCH_CACHE_VERSION) return;

  Object.values(DASHBOARD_SEARCH_CACHE_KEYS).forEach(key => storage.removeItem(key));
  storage.setItem(VERSION_KEY, DASHBOARD_SEARCH_CACHE_VERSION);
}
