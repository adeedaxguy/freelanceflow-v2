import { API_SCOPES, createApiKey, getApiDailyLimit, hashApiKey, parseScopes } from "@/lib/public-api";
import { publicJobSearchSchema, publicLocalSearchSchema } from "@/lib/public-api-search";

describe("public API keys", () => {
  it("creates non-recoverable, unique public API secrets", () => {
    const first = createApiKey();
    const second = createApiKey();

    expect(first.secret).toMatch(/^icl_live_[A-Za-z0-9_-]+$/);
    expect(first.hash).toBe(hashApiKey(first.secret));
    expect(first.hash).not.toContain(first.secret);
    expect(first.secret).not.toBe(second.secret);
  });

  it("accepts only known scopes", () => {
    expect(parseScopes(JSON.stringify([...API_SCOPES, "admin:write"]))).toEqual(API_SCOPES);
    expect(parseScopes("not-json")).toEqual([]);
  });

  it("limits access to Agency and admin accounts", () => {
    expect(getApiDailyLimit("free", "USER")).toBe(0);
    expect(getApiDailyLimit("pro", "USER")).toBe(0);
    expect(getApiDailyLimit("agency", "USER")).toBe(250);
    expect(getApiDailyLimit("free", "ADMIN")).toBe(1000);
  });
});

describe("public API query contracts", () => {
  it("normalizes local business pagination", () => {
    const result = publicLocalSearchSchema.parse({
      keyword: " plumber ",
      location: " Austin, TX ",
      limit: "10",
      cursor: "20",
    });
    expect(result).toMatchObject({ keyword: "plumber", location: "Austin, TX", limit: 10, cursor: 20 });
  });

  it("normalizes comma-separated job niches and booleans", () => {
    const result = publicJobSearchSchema.parse({
      niches: "web-development, seo",
      has_email: "true",
      urgent_only: "false",
    });
    expect(result.niches).toEqual(["web-development", "seo"]);
    expect(result.has_email).toBe(true);
    expect(result.urgent_only).toBe(false);
  });
});
