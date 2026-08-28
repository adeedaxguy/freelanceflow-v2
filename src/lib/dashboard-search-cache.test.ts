import {
  DASHBOARD_SEARCH_CACHE_KEYS,
  DASHBOARD_SEARCH_CACHE_VERSION,
  prepareDashboardSearchCache,
} from "./dashboard-search-cache";

describe("dashboard search cache", () => {
  beforeEach(() => sessionStorage.clear());

  it("clears stale search results once and keeps current results between tools", () => {
    Object.values(DASHBOARD_SEARCH_CACHE_KEYS).forEach(key => sessionStorage.setItem(key, "cached"));

    prepareDashboardSearchCache(sessionStorage);

    expect(sessionStorage.getItem("icl_cache_v")).toBe(DASHBOARD_SEARCH_CACHE_VERSION);
    Object.values(DASHBOARD_SEARCH_CACHE_KEYS).forEach(key => expect(sessionStorage.getItem(key)).toBeNull());

    sessionStorage.setItem(DASHBOARD_SEARCH_CACHE_KEYS.local, "new local results");
    prepareDashboardSearchCache(sessionStorage);
    expect(sessionStorage.getItem(DASHBOARD_SEARCH_CACHE_KEYS.local)).toBe("new local results");
  });
});
