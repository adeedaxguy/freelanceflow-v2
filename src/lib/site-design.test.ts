import { resolveDesignVariation } from "@/lib/site-design";

describe("site design variation matching", () => {
  it.each([
    ["Sunrise Bakery", "Bakery", "restaurant-menu"],
    ["Bright Smile Dental", "Dentist", "clinic-care"],
    ["Northline Plumbing", "Plumber", "trade-emergency"],
    ["Prime Homes", "Real estate agency", "real-estate-listings"],
    ["Move Lab", "Fitness studio", "fitness-membership"],
    ["Apex Tax", "CPA accountant", "legal-trust"],
  ])("matches %s to a category-specific template", (company, category, template) => {
    expect(resolveDesignVariation({ company, category }).template).toBe(template);
  });

  it("lets category outrank generic premium mood words", () => {
    const variation = resolveDesignVariation({
      company: "Rose Oven",
      category: "Bakery",
      prompt: "Premium high-end website with elegant photography",
    });

    expect(variation.template).toBe("restaurant-menu");
    expect(variation.style).toBe("friendly");
  });
});
