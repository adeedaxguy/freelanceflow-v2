import { render, screen } from "@testing-library/react";
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
});
