import {
  CAMPAIGN_DUPLICATE_WINDOW_MS,
  campaignContentHash,
  hasRecentMatchingCampaign,
} from "./campaign-delivery";

describe("campaign delivery safeguards", () => {
  const now = new Date("2026-08-15T12:00:00.000Z");

  it("uses normalized content for stable fingerprints", () => {
    expect(campaignContentHash(" Product update ", "Hello   there"))
      .toBe(campaignContentHash("product UPDATE", "hello there"));
  });

  it("blocks recent matching content and legacy same-subject sends", () => {
    expect(hasRecentMatchingCampaign([
      {
        value: JSON.stringify({ subject: "Product update", contentHash: campaignContentHash("Product update", "New features") }),
        updatedAt: new Date(now.getTime() - 60_000),
      },
    ], "Product update", "New features", now)).toBe(true);

    expect(hasRecentMatchingCampaign([
      {
        value: JSON.stringify({ subject: "Product update" }),
        updatedAt: new Date(now.getTime() - 60_000),
      },
    ], "Product update", "Legacy content was not stored", now)).toBe(true);
  });

  it("allows the campaign after the cooldown expires", () => {
    expect(hasRecentMatchingCampaign([
      {
        value: JSON.stringify({ subject: "Product update" }),
        updatedAt: new Date(now.getTime() - CAMPAIGN_DUPLICATE_WINDOW_MS - 1),
      },
    ], "Product update", "New features", now)).toBe(false);
  });
});
