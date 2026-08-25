import { guessEmails, searchLocalBusinesses } from "./local-leads-engine";

describe("local lead email guesses", () => {
  it("uses the registrable host without a www prefix", () => {
    expect(guessEmails("www.example.com")).toContain("info@example.com");
    expect(guessEmails("https://www.example.com/contact")).toContain("hello@example.com");
  });
});

describe("local lead fallbacks", () => {
  const realFetch = global.fetch;
  const realAbortTimeout = AbortSignal.timeout;
  const fetchMock = jest.fn();
  const db = {
    $executeRawUnsafe: jest.fn(async () => undefined),
    $queryRawUnsafe: jest.fn(async () => []),
  };

  beforeEach(() => {
    fetchMock.mockReset();
    db.$executeRawUnsafe.mockClear();
    db.$queryRawUnsafe.mockClear();
    global.fetch = fetchMock;
    AbortSignal.timeout = jest.fn(() => new AbortController().signal);
  });

  afterEach(() => {
    global.fetch = realFetch;
    AbortSignal.timeout = realAbortTimeout;
  });

  it("drops Photon street matches that look like businesses only by text", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      if (url.includes("nominatim.openstreetmap.org") && !url.includes("extratags=1")) {
        return {
          ok: true,
          json: async () => [{ lat: "30.2672", lon: "-97.7431", boundingbox: ["30.0", "30.5", "-98.0", "-97.4"] }],
        };
      }
      if (url.includes("photon.komoot.io")) {
        return {
          ok: true,
          json: async () => ({
            features: [
              {
                geometry: { coordinates: [-97.72, 30.27] },
                properties: {
                  osm_id: 1,
                  osm_type: "W",
                  osm_key: "highway",
                  osm_value: "residential",
                  name: "Plumbrook Drive",
                  city: "Austin",
                  country: "United States",
                },
              },
              {
                geometry: { coordinates: [-97.74, 30.28] },
                properties: {
                  osm_id: 2,
                  osm_type: "N",
                  osm_key: "craft",
                  osm_value: "plumber",
                  name: "Austin Plumbing Pros",
                  city: "Austin",
                  country: "United States",
                },
              },
            ],
          }),
        };
      }
      if (url.includes("nominatim.openstreetmap.org") && url.includes("extratags=1")) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes("opencorporates.com")) {
        return { ok: true, json: async () => ({ results: { companies: [] } }) };
      }
      if (init?.method === "POST") {
        return { ok: true, json: async () => ({ elements: [] }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    const result = await searchLocalBusinesses({
      keyword: "plumber",
      location: "Austin, TX",
      filter: "all",
      limit: 10,
      userId: "test-user",
      db: db as never,
    });

    const names = result.leads.map(lead => lead.name);
    expect(names).toContain("Austin Plumbing Pros");
    expect(names).not.toContain("Plumbrook Drive");
  });
});
