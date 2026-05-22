import { searchDomain } from "@/lib/hunter";

global.fetch = jest.fn();

describe("searchDomain (Hunter.io client)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, HUNTER_API_KEY: "test-key-123" };
  });

  afterEach(() => { process.env = originalEnv; });

  it("throws when HUNTER_API_KEY is not set", async () => {
    delete process.env.HUNTER_API_KEY;
    await expect(searchDomain({ domain: "stripe.com" })).rejects.toThrow("HUNTER_API_KEY is not configured");
  });

  it("returns parsed domain search results", async () => {
    const mockResponse = {
      data: {
        domain: "stripe.com",
        organization: "Stripe",
        webmail: false,
        emails: [
          { value: "john@stripe.com", type: "personal", confidence: 95, first_name: "John", last_name: "Smith", position: "CTO" },
        ],
      },
      meta: { results: 1, limit: 10, offset: 0, params: { domain: "stripe.com" } },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await searchDomain({ domain: "stripe.com" });

    expect(result.domain).toBe("stripe.com");
    expect(result.organization).toBe("Stripe");
    expect(result.emails).toHaveLength(1);
    expect(result.emails[0]?.value).toBe("john@stripe.com");
    expect(result.emails[0]?.confidence).toBe(95);
    expect(result.total).toBe(1);
  });

  it("throws on non-ok API response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    });

    await expect(searchDomain({ domain: "stripe.com" })).rejects.toThrow("Hunter.io API error: 401 - Unauthorized");
  });

  it("includes correct API key in request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { domain: "test.com", organization: "Test", webmail: false, emails: [] }, meta: { results: 0, limit: 10, offset: 0, params: {} } }),
    });

    await searchDomain({ domain: "test.com", limit: 5 });

    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0]?.[0] as string;
    expect(fetchUrl).toContain("api_key=test-key-123");
    expect(fetchUrl).toContain("domain=test.com");
    expect(fetchUrl).toContain("limit=5");
  });
});
