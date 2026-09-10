import { render, screen } from "@testing-library/react";
import HelpPage from "./page";

jest.mock("@/components/Navbar", () => () => null);
jest.mock("@/components/Footer", () => () => null);

describe("help search and navigation", () => {
  it("offers a native accessible search and real category targets", async () => {
    const { container } = render(await HelpPage({}));
    expect(screen.getByRole("searchbox", { name: "Search help articles" })).toHaveAttribute("name", "q");
    expect(screen.getByRole("search")).toHaveAttribute("method", "get");
    expect(screen.getByRole("search")).toHaveAttribute("action", "/help");
    expect(screen.getByRole("link", { name: "View API Docs" })).toHaveAttribute("href", "/developers");
    for (const link of Array.from(container.querySelectorAll('a[href^="#"]'))) {
      expect(container.querySelector(link.getAttribute("href")!)).not.toBeNull();
    }
  });

  it("searches answers case-insensitively and keeps structured data consistent", async () => {
    const { container } = render(await HelpPage({ searchParams: Promise.resolve({ q: "  STRIPE  " }) }));
    expect(screen.getByText("How does billing work?")).toBeInTheDocument();
    expect(screen.queryByText("How do I find my first lead?")).not.toBeInTheDocument();
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema.mainEntity).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Account Settings/ })).toHaveAttribute("href", "/help#account");
  });

  it("provides an empty state and recovery", async () => {
    render(await HelpPage({ searchParams: Promise.resolve({ q: "no-such-article-qa" }) }));
    expect(screen.getByRole("status")).toHaveTextContent("No answers found");
    expect(screen.getByRole("link", { name: "Show all answers" })).toHaveAttribute("href", "/help");
  });
});
