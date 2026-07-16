import { buildDecisionFinderSearchLinks } from "@/lib/decision-maker-finder";

function queryFromGoogleUrl(url: string) {
  return new URL(url).searchParams.get("q") ?? "";
}

describe("decision-maker owner search links", () => {
  it("starts local-lead owner discovery with a broad city-level Google query", () => {
    const links = buildDecisionFinderSearchLinks({
      company: "Mitchell Maids Cleaning Service",
      country: "us",
      location: "96 Trinity Street, Austin, TX 78701",
      profileUrl: "https://www.google.com/maps/search/Mitchell%20Maids%20Cleaning%20Service",
    });

    const primaryQuery = queryFromGoogleUrl(links[0]!.url);
    const roleMentionsQuery = queryFromGoogleUrl(links[1]!.url);
    const exactFallbackQuery = queryFromGoogleUrl(links[2]!.url);
    const linkedInQuery = queryFromGoogleUrl(links.find(link => link.label === "LinkedIn profile search")!.url);

    expect(links[0]!.label).toBe("Find possible owner name");
    expect(primaryQuery).toBe("Mitchell Maids Cleaning Service Austin TX owner");
    expect(primaryQuery).not.toMatch(/["()]/);
    expect(primaryQuery).not.toMatch(/\bOR\b/);

    expect(roleMentionsQuery).toBe("Mitchell Maids Cleaning Service Austin TX owner founder manager");
    expect(roleMentionsQuery).not.toMatch(/["()]/);
    expect(roleMentionsQuery).not.toMatch(/\bOR\b/);

    expect(exactFallbackQuery).toBe("\"Mitchell Maids Cleaning Service\" owner Austin TX");
    expect(linkedInQuery).toBe("site:linkedin.com/in Mitchell Maids Cleaning Service Austin TX owner founder");
  });
});
