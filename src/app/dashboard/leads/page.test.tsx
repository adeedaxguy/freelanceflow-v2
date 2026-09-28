import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeadsPage from "./page";
import { DASHBOARD_SEARCH_CACHE_KEYS, DASHBOARD_SEARCH_CACHE_VERSION } from "@/lib/dashboard-search-cache";

jest.mock("@/lib/leads-aggregator", () => ({ ALL_SOURCE_LABELS: { arbeitnow: "Arbeitnow" }, DEFAULT_DISABLED_SOURCES: new Set() }));
jest.mock("@/lib/analytics", () => ({ trackAnalyticsEvent: jest.fn() }));
jest.mock("@/components/BonusLeadsModal", () => () => null);
jest.mock("@/components/AdSenseUnit", () => ({ LeadResultsAd: () => null }));
jest.mock("@/components/LeadApplicationControls", () => ({
  AppliedButton: () => null,
  AppliedReturnPrompt: () => null,
  useLeadApplications: () => ({ appliedByUrl: {}, countsByUrl: {}, pendingPrompt: null }),
}));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("icl_cache_v", DASHBOARD_SEARCH_CACHE_VERSION);
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
});
afterEach(() => { cleanup(); jest.restoreAllMocks(); });

it("lets keyboard users open mobile filters, toggle them and clear them", async () => {
  const user = userEvent.setup();
  render(<LeadsPage />);
  const filter = screen.getByRole("button", { name: "Filter jobs" });
  await user.click(filter);
  expect(filter).toHaveAttribute("aria-expanded", "true");
  const toggle = screen.getByRole("switch", { name: "Has Email" });
  toggle.focus();
  await user.keyboard(" ");
  expect(toggle).toBeChecked();
  fireEvent.change(screen.getByRole("slider", { name: "Minimum Match Score" }), { target: { value: "60" } });
  await user.click(screen.getByRole("button", { name: "Clear Filters" }));
  expect(toggle).not.toBeChecked();
  expect(screen.getByRole("slider", { name: "Minimum Match Score" })).toHaveValue("0");
});

it("keeps sorting and contact tabs usable with restored results without searching again", async () => {
  sessionStorage.setItem(DASHBOARD_SEARCH_CACHE_KEYS.remote, JSON.stringify({
    searched: true,
    leads: [{ id: "job-1", company: "Example", domain: "example.com", title: "Frontend engineer",
      description: "Build a dashboard", url: "https://example.com/job", source: "arbeitnow",
      sourceLabel: "Arbeitnow", postedAt: "2026-09-29T00:00:00Z", hoursAgo: 1, tags: [],
      niche: "web-development", confidence: 80, qualityScore: 80, email: "jobs@example.com" }],
  }));
  render(<LeadsPage />);
  expect(await screen.findByText("Frontend engineer")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Freshest First" }));
  fireEvent.click(screen.getByRole("button", { name: "Best Quality" }));
  expect(screen.getByRole("button", { name: "Best Quality" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Contacts (1)" }));
  expect(screen.getByText("jobs@example.com")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Leads (1)" }));
  expect(screen.getByText("Frontend engineer")).toBeInTheDocument();
  expect((fetch as jest.Mock).mock.calls.every(([url]) => url === "/api/usage")).toBe(true);
});
