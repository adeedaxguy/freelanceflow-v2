import { render, screen, waitFor } from "@testing-library/react";
import WebDesignPage from "./page";

let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

function previewParams() {
  const href = screen.getByText("Preview").closest("a")?.getAttribute("href") ?? "";
  return new URLSearchParams(href.split("?")[1] ?? "");
}

describe("web design studio defaults", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    sessionStorage.clear();
  });

  it("seeds the preview recipe from the matched business category", () => {
    mockSearchParams = new URLSearchParams({
      company: "Sunrise Bakery",
      category: "Bakery",
      location: "Austin, TX",
    });

    render(<WebDesignPage />);

    const params = previewParams();
    expect(params.get("variation")).toContain("restaurant-visit");
    expect(params.get("style")).toBe("friendly");
    expect(params.get("sections")).toBe("9");
    expect(params.get("conversionGoal")).toBe("visits");
    expect(params.get("layout")).toBe("showcase");
  });

  it("uses the design prompt when the lead category is only a placeholder", () => {
    mockSearchParams = new URLSearchParams({
      company: "Local Business",
      category: "Local service",
      location: "London, UK",
      prompt: "Premium bakery website with warm photography, online ordering, and a clear catering enquiry.",
    });

    render(<WebDesignPage />);

    expect(screen.getAllByText(/Lead with fresh products/i).length).toBeGreaterThan(0);
    expect(previewParams().get("variation")).toContain("restaurant-visit");
  });

  it("restores an in-progress concept when the user returns", async () => {
    mockSearchParams = new URLSearchParams({
      company: "Sunrise Bakery",
      category: "Bakery",
      location: "Austin, TX",
    });
    sessionStorage.setItem("ff_web_design_draft:sunrise bakery|austin, tx|", JSON.stringify({
      activeStep: 2,
      style: "premium",
      theme: "light",
      sections: "11",
      images: "gallery",
      contentDepth: "detailed",
      conversionGoal: "visits",
      layout: "editorial",
      prompt: "A premium neighbourhood bakery with catering and online ordering.",
      variation: "restaurant-visit",
      headline: "Fresh from our ovens",
      subheadline: "Small-batch bread, pastries, and catering for Austin.",
      cta: "Plan a visit",
      accent: "#db6b31",
    }));

    render(<WebDesignPage />);

    await waitFor(() => expect(previewParams().get("style")).toBe("premium"));
    expect(previewParams().get("sections")).toBe("11");
    expect(previewParams().get("headline")).toBe("Fresh from our ovens");
    expect(screen.getByText("Make the concept sound like this client")).toBeInTheDocument();
  });
});
