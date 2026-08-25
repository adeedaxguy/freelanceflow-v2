import { getSiteDraftIdentity } from "@/lib/site-draft";

describe("site draft identity", () => {
  const genericLead = {
    company: "Local Business",
    category: "Local service",
    location: "London, UK",
  };

  it("uses the creative brief to resolve a placeholder lead into the right business", () => {
    const identity = getSiteDraftIdentity(
      genericLead,
      "Premium bakery website with warm photography, online ordering, and a clear catering enquiry.",
    );

    expect(identity.segment).toBe("bakery");
    expect(identity.primaryCta).toBe("Order online");
    expect(identity.pages).toContain("Celebration cakes");
    expect(identity.headline).not.toContain("made easier to trust");
  });

  it("keeps normal company and category matching unchanged", () => {
    const identity = getSiteDraftIdentity({
      company: "Northside Auto Repair",
      category: "Mechanic",
      location: "Austin, TX",
    });

    expect(identity.segment).toBe("auto");
    expect(identity.primaryCta).toContain("estimate");
  });

  it.each([
    ["Little Steps", "Daycare", "education"],
    ["FreshJet", "Pressure washing", "cleaning"],
    ["Ledger North", "CPA accountant", "professional"],
    ["Northline Plumbing", "Plumber", "trade"],
  ])("recognizes common local categories for %s", (company, category, segment) => {
    expect(getSiteDraftIdentity({ company, category, location: "Denver, CO" }).segment).toBe(segment);
  });
});
