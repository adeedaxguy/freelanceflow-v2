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

  it("excludes explicitly expired Himalayas jobs and clears completed request timers", async () => {
    const job = {
      title: "Senior React TypeScript Developer &#x28;Remote&#x29;", companyName: "Test &amp; Company",
      pubDate: "2026-08-26T10:00:00Z", description: "Remote contract React and TypeScript web developer.",
      categories: ["web developer", "react"], employmentType: "Contractor",
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ jobs: [
      { ...job, guid: "expired", applicationLink: "https://himalayas.app/jobs/expired", expiryDate: Math.floor(new Date("2026-08-26T11:00:00Z").getTime() / 1000) },
      { ...job, guid: "active", applicationLink: "https://himalayas.app/jobs/active", expiryDate: "2026-09-01T00:00:00Z" },
      { ...job, companyName: "Another Company", guid: "unknown", applicationLink: "https://himalayas.app/jobs/unknown" },
    ] }) });
    const { leads } = await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "himalayas", maxHours: 72, minConfidence: 0, freshOnly: true,
    });
    expect(leads.map(lead => lead.id).sort()).toEqual(["him-active", "him-unknown"]);
    expect(leads[0].title).toBe("Senior React TypeScript Developer (Remote)");
    expect(leads.find(lead => lead.id === "him-active")?.company).toBe("Test & Company");
    expect(jest.getTimerCount()).toBe(0);
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
          `<entry><title>[Hiring] Remote social media manager for ecommerce brand</title><id>tag:reddit.com,200</id><updated>2026-08-26T11:00:00Z</updated><content>Need a remote social media manager for paid work. Email owner@examplebrand.com.</content><author><name>brandowner</name></author><link rel="alternate" href="https://reddit.com/r/forhire/comments/hiring"/></entry>`,
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

  it("maps RemoteJobs.org listings into leads", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "remotejobs-1",
            title: "Senior React Developer",
            url: "https://remotejobs.org/remote-jobs/senior-react-developer",
            apply_url: "https://remotejobs.org/remote-jobs/senior-react-developer",
            company: { name: "Remote Co", website: "https://remote.example" },
            category: { name: "Programming", slug: "programming" },
            type: "Contract",
            description: "Contract React and TypeScript web app project. Budget: $6,000.",
            posted_at: "2026-08-26T10:00:00Z",
            salary_text: "$6,000 project",
          },
        ],
      }),
    });

    const { leads } = await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "remotejobsorg",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(leads[0]).toMatchObject({
      id: "rjo-remotejobs-1",
      source: "remotejobsorg",
      company: "Remote Co",
      title: "Senior React Developer",
    });
  });

  it("uses the current Jobicy API without the stale worldwide geo filter", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [
          {
            id: 1,
            jobTitle: "Remote React Engineer",
            companyName: "Jobicy Co",
            jobIndustry: ["Software Engineering"],
            jobDescription: "React and TypeScript remote engineering role.",
            url: "https://jobicy.com/jobs/react-engineer",
            pubDate: "2026-08-26T10:00:00Z",
          },
        ],
      }),
    });

    await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "jobicy",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("https://jobicy.com/api/v2/remote-jobs?count=100");
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("geo=worldwide");
  });

  it("maps fresh remote employer-direct jobs from Job Opportunities", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "opportunity-1",
            title: "Contract React Developer",
            company: "Direct Co",
            category: "Engineering",
            remote: "remote",
            posted_at: "2026-08-26T10:00:00Z",
            apply_url: "https://jobs.ashbyhq.com/direct-co/react-developer/application",
            source: "ashby",
            description: "Build a React and TypeScript web app for a remote client project.",
          },
        ],
      }),
    });

    const { leads } = await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "jobopportunities",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("api.jobopportunitiesapi.org/public/jobs");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("remote=remote");
    expect(leads[0]).toMatchObject({
      id: "joa-opportunity-1",
      source: "jobopportunities",
      company: "Direct Co",
      title: "Contract React Developer",
    });
  });

  it("keeps only explicitly remote Arbeitnow jobs", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            slug: "onsite-react",
            company_name: "Office Co",
            title: "React Developer",
            description: "Build a React app from our Berlin office.",
            url: "https://arbeitnow.com/onsite-react",
            remote: false,
            location: "Berlin",
            created_at: Math.floor(new Date("2026-08-26T10:00:00Z").getTime() / 1000),
          },
          {
            slug: "remote-react",
            company_name: "Remote Co",
            title: "Remote React Developer",
            description: "Build a React and TypeScript web app from anywhere.",
            url: "https://arbeitnow.com/remote-react",
            remote: true,
            location: "Remote",
            created_at: Math.floor(new Date("2026-08-26T10:30:00Z").getTime() / 1000),
          },
        ],
      }),
    });

    const { leads } = await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "arbeitnow",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(leads.map(lead => lead.id)).toEqual(["arb-remote-react"]);
  });

  it("respects Lever's hybrid and onsite fields even when benefits mention remote work", async () => {
    const job = {
      text: "Senior React TypeScript Developer", createdAt: new Date("2026-08-26T10:00:00Z").getTime(),
      descriptionPlain: "Build React applications. Benefits include remote opportunities.",
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => [
      { ...job, id: "hybrid", workplaceType: "hybrid", hostedUrl: "https://jobs.lever.co/test/hybrid" },
      { ...job, id: "office", workplaceType: "on-site", hostedUrl: "https://jobs.lever.co/test/office" },
      { ...job, id: "remote", workplaceType: "remote", hostedUrl: "https://jobs.lever.co/test/remote" },
    ] });
    const { leads } = await aggregateLeadsWithDiagnostics("web-development", { filterSource: "lever", maxHours: 72, minConfidence: 0 });
    expect(leads).toHaveLength(1);
    expect(leads[0].url).toBe("https://jobs.lever.co/test/remote");
  });

  it("does not override Ashby's explicit non-remote flag with description keywords", async () => {
    const job = {
      title: "Senior React TypeScript Developer", publishedAt: "2026-08-26T10:00:00Z",
      descriptionPlain: "Build React applications. Benefits include remote opportunities.",
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ jobs: [
      { ...job, id: "office", isRemote: false, jobUrl: "https://jobs.ashbyhq.com/test/office" },
      { ...job, id: "remote", isRemote: true, jobUrl: "https://jobs.ashbyhq.com/test/remote" },
    ] }) });
    const { leads } = await aggregateLeadsWithDiagnostics("web-development", { filterSource: "ashby", maxHours: 72, minConfidence: 0 });
    expect(leads).toHaveLength(1);
    expect(leads[0].url).toBe("https://jobs.ashbyhq.com/test/remote");
  });

  it("maps Remote First Jobs RSS with source attribution", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => `
        <rss><channel><item>
          <title>Senior React Developer at Fresh Remote Co</title>
          <link>https://remotefirstjobs.com/companies/fresh/jobs/react-1</link>
          <guid>react-1</guid>
          <pubDate>Wed, 26 Aug 2026 10:00:00 +0000</pubDate>
          <description>&lt;p&gt;Remote contract role building a React and TypeScript web app. Budget $8,000.&lt;/p&gt;</description>
        </item></channel></rss>
      `,
    });

    const { leads } = await aggregateLeadsWithDiagnostics("web-development", {
      filterSource: "remotefirstjobs",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(leads[0]).toMatchObject({
      id: "rfj-react-1",
      source: "remotefirstjobs",
      sourceLabel: "Remote First Jobs",
      company: "Fresh Remote Co",
      title: "Senior React Developer",
    });
  });

  it("uses Web3 Jobs Radar only for blockchain searches", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [{
          id: "web3-1",
          title: "Remote Solidity Engineer",
          company: "Chain Co",
          applyUrl: "https://jobs.ashbyhq.com/chain/solidity",
          location: "Remote",
          remote: "remote",
          role: "engineering",
          seniority: "mid",
          tags: ["solidity", "smart contract"],
          postedAt: "2026-08-26T10:00:00Z",
          salary: { min: 140000, max: 180000, currency: "USD" },
        }],
      }),
    });

    const { leads } = await aggregateLeadsWithDiagnostics("blockchain", {
      filterSource: "web3jobsradar",
      maxHours: 72,
      minConfidence: 0,
      freshOnly: true,
    });

    expect(leads[0]).toMatchObject({
      id: "w3r-web3-1",
      source: "web3jobsradar",
      company: "Chain Co",
      title: "Remote Solidity Engineer",
    });
  });
});
