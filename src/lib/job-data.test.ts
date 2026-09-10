import { companyWebsiteDomain, requiresOfficeWork, sanitizeLegacyJobDomain } from "./job-data";

describe("job evidence", () => {
  it.each(["", "jobs.lever.co/acme/123", "https://boards.greenhouse.io/acme", "javascript:alert(1)", "https://user:pass@example.com"])("does not treat %s as a company website", value => {
    expect(companyWebsiteDomain(value)).toBe("");
  });
  it("keeps a source-provided company website", () => {
    expect(companyWebsiteDomain("https://www.acme.co/about")).toBe("acme.co");
  });
  it("hides legacy guesses without changing local or manual leads", () => {
    const lead = { company: "Example Studio", domain: "examplestudio.com", source: "greenhouse", notes: "Keep me" };
    expect(sanitizeLegacyJobDomain(lead)).toEqual({ ...lead, domain: "" });
    expect(sanitizeLegacyJobDomain({ ...lead, source: "local_business" }).domain).toBe(lead.domain);
    expect(sanitizeLegacyJobDomain({ ...lead, isManual: true }).domain).toBe(lead.domain);
    expect(lead.domain).toBe("examplestudio.com");
  });
  it.each(["React developer (Hybrid)", "On-site developer", "In office React developer"])("excludes %s", title => {
    expect(requiresOfficeWork(title)).toBe(true);
  });
  it.each(["Hybrid cloud engineer", "Remote or hybrid developer", "Hybrid / Remote developer", "No onsite work: React developer"])("retains %s", title => {
    expect(requiresOfficeWork(title)).toBe(false);
  });
  it("respects explicit office requirements in the brief", () => {
    expect(requiresOfficeWork("React developer", "You must work in our office three days a week.")).toBe(true);
    expect(requiresOfficeWork("React developer", "Workplace: hybrid")).toBe(true);
    expect(requiresOfficeWork("React developer", "Workplace: hybrid or remote")).toBe(false);
  });
});
