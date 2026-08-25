import { aggregateLeadsWithDiagnostics } from "./leads-aggregator";

describe("remote lead ranking", () => {
  const fetchMock = jest.fn();
  const realFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-26T12:00:00Z"));
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = realFetch;
    jest.useRealTimers();
  });

  it("prioritizes stronger fit over merely newer postings", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "fresh",
          epoch: Math.floor(new Date("2026-08-26T11:00:00Z").getTime() / 1000),
          company: "Fresh Co",
          company_url: "https://fresh.example",
          url: "https://remoteok.com/fresh",
          title: "React Developer",
          description: "React project support.",
          tags: ["react"],
        },
        {
          id: "better",
          epoch: Math.floor(new Date("2026-08-25T12:00:00Z").getTime() / 1000),
          company: "Better Co",
          company_url: "https://better.example",
          url: "https://remoteok.com/better",
          title: "Senior React TypeScript Full Stack Developer",
          description: "We are looking to hire a contract developer for a Next.js web app. Budget: $5,000. Email owner@better.example for details.",
          tags: ["react", "typescript", "nextjs", "contract"],
        },
      ],
    });

    const { leads } = await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "remoteok",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(leads.map(lead => lead.id)).toEqual(["rok-better", "rok-fresh"]);
  });

  it("filters Reddit job seekers from hiring leads", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      const entries = url.includes("/r/forhire/")
        ? [
          `<entry><title>[Hiring] Social media manager for ecommerce brand</title><id>tag:reddit.com,200</id><updated>2026-08-26T11:00:00Z</updated><content>Need a social media manager for paid work. Email owner@examplebrand.com.</content><author><name>brandowner</name></author><link rel="alternate" href="https://reddit.com/r/forhire/comments/hiring"/></entry>`,
          `<entry><title>Looking for a remote VA, Social media manager job</title><id>tag:reddit.com,201</id><updated>2026-08-26T11:30:00Z</updated><content>I am open to work and looking for a remote job.</content><author><name>jobseeker</name></author><link rel="alternate" href="https://reddit.com/r/forhire/comments/seeker"/></entry>`,
        ].join("")
        : "";
      return { ok: true, text: async () => `<feed>${entries}</feed>` };
    });

    const { leads } = await aggregateLeadsWithDiagnostics("social-media", {
      filterSource: "reddit",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(leads.map(lead => lead.url)).toEqual(["https://reddit.com/r/forhire/comments/hiring"]);
  });
});
