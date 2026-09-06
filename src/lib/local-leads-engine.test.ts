jest.mock("node:dns/promises", () => ({
  lookup: jest.fn(async () => [{ address: "93.184.216.34", family: 4 }]),
}));

import { searchLocalBusinesses } from "./local-leads-engine";

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

  it("keeps a current scheme-less website out of outdated results and uses its published email", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      if (url.includes("nominatim.openstreetmap.org") && !url.includes("extratags=1")) {
        return {
          ok: true,
          json: async () => [{ lat: "34.1478", lon: "-118.1445", boundingbox: ["33.9", "34.4", "-118.5", "-117.8"] }],
        };
      }
      if (url.includes("photon.komoot.io")) {
        return {
          ok: true,
          json: async () => ({
            features: [{
              geometry: { coordinates: [-118.098, 34.146] },
              properties: {
                osm_id: 22,
                osm_type: "N",
                osm_key: "healthcare",
                osm_value: "dentist",
                name: "Pasadena Childrens Dentistry & Orthodontist",
                city: "Pasadena",
                country: "United States",
                website: "pasadenachildrensdentistry.com",
              },
            }],
          }),
        };
      }
      if (url === "https://pasadenachildrensdentistry.com/") {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "text/html" }),
          text: async () => `
            <html><head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <meta property="og:updated_time" content="2026-04-07T21:25:08+00:00">
              <script type="application/ld+json">{"email":"info1@pasadenachildrensdentistry.com"}</script>
            </head><body>Call (626) 600-7171</body></html>
          `,
        };
      }
      if (url.includes("nominatim.openstreetmap.org") && url.includes("extratags=1")) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes("opencorporates.com")) {
        return { ok: true, json: async () => ({ results: { companies: [] } }) };
      }
      if (init?.method === "POST") return { ok: true, json: async () => ({ elements: [] }) };
      return { ok: true, json: async () => ({}) };
    });

    const all = await searchLocalBusinesses({
      keyword: "orthodontist",
      location: "Pasadena, CA",
      filter: "all",
      limit: 10,
      userId: "test-user",
      db: db as never,
    });
    const lead = all.leads[0];

    expect(lead).toMatchObject({
      website: "https://pasadenachildrensdentistry.com/",
      websiteStatus: "alive",
      email: "info1@pasadenachildrensdentistry.com",
    });
    expect(lead).not.toHaveProperty("guessedEmails");
    expect(lead?.pitchOpener).toContain("Would you be open to a short website review");
    expect(lead?.pitchOpener).not.toMatch(/spotted|competitors|rank on page 1/i);

    const outdated = await searchLocalBusinesses({
      keyword: "orthodontist",
      location: "Pasadena, CA",
      filter: "outdated_website",
      limit: 10,
      userId: "test-user",
      db: db as never,
    });
    expect(outdated.leads).toEqual([]);
  });

  it("includes a site only when the outdated evidence is explicit", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      if (url.includes("nominatim.openstreetmap.org") && !url.includes("extratags=1")) {
        return {
          ok: true,
          json: async () => [{ lat: "34.0522", lon: "-118.2437", boundingbox: ["33.7", "34.4", "-118.7", "-117.7"] }],
        };
      }
      if (url.includes("photon.komoot.io")) {
        return {
          ok: true,
          json: async () => ({
            features: [{
              geometry: { coordinates: [-118.24, 34.05] },
              properties: {
                osm_id: 23,
                osm_type: "N",
                osm_key: "healthcare",
                osm_value: "dentist",
                name: "Legacy Orthodontist",
                city: "Los Angeles",
                country: "United States",
                website: "legacyorthodontist.example",
              },
            }],
          }),
        };
      }
      if (url === "https://legacyorthodontist.example/") {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "text/html" }),
          text: async () => '<html><head><meta name="generator" content="WordPress 4.9"></head><body></body></html>',
        };
      }
      if (url.includes("nominatim.openstreetmap.org") && url.includes("extratags=1")) {
        return { ok: true, json: async () => [] };
      }
      if (url.includes("opencorporates.com")) {
        return { ok: true, json: async () => ({ results: { companies: [] } }) };
      }
      if (init?.method === "POST") return { ok: true, json: async () => ({ elements: [] }) };
      return { ok: true, json: async () => ({}) };
    });

    const result = await searchLocalBusinesses({
      keyword: "orthodontist",
      location: "Los Angeles legacy fixture",
      filter: "outdated_website",
      limit: 10,
      userId: "test-user",
      db: db as never,
    });

    expect(result.leads).toHaveLength(1);
    expect(result.leads[0]).toMatchObject({ websiteStatus: "outdated", websiteTech: "Old WordPress" });
    expect(result.leads[0]?.pitchOpener).toContain("automated check");
    expect(result.leads[0]?.pitchOpener).toContain("Old WordPress");
    expect(result.leads[0]?.pitchPoints.join(" ")).not.toMatch(/62%|60%|double enquiries/i);
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
              {
                geometry: { coordinates: [-97.73, 30.29] },
                properties: {
                  osm_id: 3,
                  osm_type: "N",
                  osm_key: "craft",
                  osm_value: "plumber",
                  name: "Plumber",
                  city: "Austin",
                  country: "United States",
                },
              },
              {
                geometry: { coordinates: [-96.8, 32.78] },
                properties: {
                  osm_id: 4,
                  osm_type: "N",
                  osm_key: "craft",
                  osm_value: "plumber",
                  name: "Dallas Plumbing Pros",
                  city: "Dallas",
                  country: "United States",
                },
              },
            ],
          }),
        };
      }
      if (url.includes("nominatim.openstreetmap.org") && url.includes("extratags=1")) {
        return {
          ok: true,
          json: async () => [{
            place_id: 5,
            osm_type: "node",
            osm_id: 5,
            lat: "33.4484",
            lon: "-112.0740",
            display_name: "Phoenix Plumbing Pros, Phoenix, Arizona",
            namedetails: { name: "Phoenix Plumbing Pros" },
            address: { city: "Phoenix", state: "Arizona", country: "United States" },
            extratags: { phone: "+1 602 555 0123" },
          }],
        };
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
    expect(names).toContain("Plumber");
    expect(names[0]).toBe("Austin Plumbing Pros");
    const unknown = result.leads.find(lead => lead.name === "Austin Plumbing Pros")!;
    expect(unknown.websiteStatus).toBe("unknown");
    expect(unknown.pitchOpener).toContain("Could you point me to your current website?");
    expect(unknown.callScript).toContain("Could you confirm your current website");
    expect(unknown.pitchPoints.join(" ")).toContain("verified needs");
    expect(result.leads.find(lead => lead.name === "Plumber")?.score).toBeLessThan(result.leads[0]!.score);
    expect(names).not.toContain("Plumbrook Drive");
    expect(names).not.toContain("Dallas Plumbing Pros");
    expect(names).not.toContain("Phoenix Plumbing Pros");
  });
});
