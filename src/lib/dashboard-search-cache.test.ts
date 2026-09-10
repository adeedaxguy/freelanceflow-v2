import {
  DASHBOARD_SEARCH_CACHE_KEYS,
  DASHBOARD_SEARCH_CACHE_VERSION,
  prepareDashboardSearchCache,
} from "./dashboard-search-cache";

describe("dashboard search cache", () => {
  beforeEach(() => sessionStorage.clear());
  it("migrates guessed job websites without losing searches or local results", () => {
    sessionStorage.setItem("icl_cache_v", "9");
    sessionStorage.setItem(DASHBOARD_SEARCH_CACHE_KEYS.local, "local results");
    sessionStorage.setItem(DASHBOARD_SEARCH_CACHE_KEYS.remote, JSON.stringify({ niche: "design", leads: [{ company: "Example Studio", domain: "examplestudio.com", source: "greenhouse", title: "Designer" }] }));
    prepareDashboardSearchCache(sessionStorage);
    expect(sessionStorage.getItem(DASHBOARD_SEARCH_CACHE_KEYS.local)).toBe("local results");
    const cached = JSON.parse(sessionStorage.getItem(DASHBOARD_SEARCH_CACHE_KEYS.remote)!);
    expect(cached.niche).toBe("design");
    expect(cached.leads).toHaveLength(1);
    expect(cached.leads[0].domain).toBe("");
    expect(cached.leads[0].title).toBe("Designer");
  });

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
