import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import LiveJobsPage from "./page";
import { DASHBOARD_SEARCH_CACHE_KEYS, DASHBOARD_SEARCH_CACHE_VERSION } from "@/lib/dashboard-search-cache";

jest.mock("@/lib/leads-aggregator", () => ({ ALL_SOURCE_LABELS: { arbeitnow: "Arbeitnow", jobicy: "Jobicy" } }));
jest.mock("@/lib/analytics", () => ({ trackAnalyticsEvent: jest.fn() }));
jest.mock("@/components/BonusLeadsModal", () => () => null);
jest.mock("@/components/AdSenseUnit", () => ({ LeadResultsAd: () => null }));
jest.mock("@/components/LeadApplicationControls", () => ({
  AppliedButton: () => null,
  AppliedReturnPrompt: () => null,
  useLeadApplications: () => ({ appliedByUrl: {}, countsByUrl: {}, pendingPrompt: null }),
}));

const key = DASHBOARD_SEARCH_CACHE_KEYS.live;
const lead = {
  id: "job-1", company: "Example", domain: "", title: "Frontend engineer",
  description: "Build a customer dashboard.", url: "https://example.com/job",
  source: "arbeitnow", sourceLabel: "Arbeitnow", hoursAgo: 1,
  niche: "web-development", confidence: 80, qualityScore: 80, email: "jobs@example.com",
};
const json = (body: unknown, ok = true) => ({ ok, json: async () => body });
const cached = () => JSON.parse(sessionStorage.getItem(key)!);

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  sessionStorage.setItem("icl_cache_v", DASHBOARD_SEARCH_CACHE_VERSION);
  global.fetch = jest.fn().mockResolvedValue(json({}));
});
afterEach(() => { cleanup(); jest.useRealTimers(); jest.restoreAllMocks(); });

it("keeps filters, shortlist and results when leaving and returning without another search", async () => {
  sessionStorage.setItem(key, JSON.stringify({ leads: [lead], fetchedAt: "2026-09-29T00:00:00Z" }));
  const view = render(<LiveJobsPage />);
  expect(await screen.findByText(lead.title)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  fireEvent.click(screen.getByRole("button", { name: "Web Dev" }));
  fireEvent.change(screen.getByLabelText("Posted within"), { target: { value: "168" } });
  fireEvent.change(screen.getByLabelText("Sort jobs"), { target: { value: "confidence" } });
  fireEvent.click(screen.getByRole("button", { name: "Arbeitnow (1)" }));
  fireEvent.click(screen.getByRole("button", { name: "Filter jobs" }));
  fireEvent.click(screen.getByRole("switch", { name: "Has email" }));
  fireEvent.change(screen.getByLabelText("Minimum confidence"), { target: { value: "70" } });
  fireEvent.click(screen.getByRole("button", { name: "Shortlist" }));
  await waitFor(() => expect(cached().favIds).toEqual([lead.id]));
  view.unmount();
  render(<LiveJobsPage />);
  expect(await screen.findByText(lead.title)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Scan 1 Niche · 7d" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Web Dev" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "SEO" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByLabelText("Posted within")).toHaveValue("168");
  expect(screen.getByLabelText("Sort jobs")).toHaveValue("confidence");
  expect(screen.getByLabelText("Minimum confidence")).toHaveValue("70");
  expect(screen.getByRole("switch", { name: "Has email" })).toBeChecked();
  expect(screen.getByRole("button", { name: "Shortlisted" })).toBeInTheDocument();
  expect(cached().sourceFilter).toBe("arbeitnow");
  expect((fetch as jest.Mock).mock.calls.every(([url]) => url === "/api/usage")).toBe(true);
});

it("restores page position, recipient filter and saved indicators", async () => {
  const leads = Array.from({ length: 26 }, (_, i) => ({ ...lead, id: `job-${i}`, title: `Job ${i}` }));
  sessionStorage.setItem(key, JSON.stringify({ leads, page: 2, hasEmail: true, savedIds: ["job-25"] }));
  render(<LiveJobsPage />);
  expect(await screen.findByText("Job 25")).toBeInTheDocument();
  expect(screen.queryByText("Job 0")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
  expect(cached().hasEmail).toBe(true);
  expect(cached().page).toBe(2);
});

it("keeps a deliberately empty niche selection across navigation", async () => {
  const view = render(<LiveJobsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  view.unmount();
  render(<LiveJobsPage />);
  expect(await screen.findByRole("button", { name: "Scan 0 Niches · 72h" })).toBeDisabled();
});

it("ignores invalid controls and clamps an out-of-range page without losing legacy results", async () => {
  sessionStorage.setItem(key, JSON.stringify({
    leads: [lead], selectedNiches: ["web-development", "unknown", "web-development"],
    maxHours: -1, sortBy: "bad", sourceFilter: "missing", minScore: 900, page: 999,
  }));
  localStorage.setItem("ff_best_match_prefs", "{broken");
  localStorage.setItem("ff_seen_lead_ids", "null");
  render(<LiveJobsPage />);
  expect(await screen.findByText(lead.title)).toBeInTheDocument();
  expect(screen.getByLabelText("Posted within")).toHaveValue("72");
  expect(screen.getByLabelText("Sort jobs")).toHaveValue("bestMatch");
  expect(cached()).toMatchObject({ sourceFilter: "all", minScore: 0, page: 1, selectedNiches: ["web-development"] });
});

it("can still search when browser storage is unavailable", async () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Unavailable"); });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Full"); });
  (fetch as jest.Mock).mockImplementation(async url => json(url === "/api/leads/search" ? { leads: [lead] } : {}));
  render(<LiveJobsPage />);
  fireEvent.click(screen.getByRole("button", { name: "Scan 13 Niches · 72h" }));
  expect(await screen.findByText(lead.title)).toBeInTheDocument();
});

it("resumes the cooldown using elapsed time and cleans up its timer", async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-09-29T00:00:00Z"));
  localStorage.setItem("ff_live_last_search", String(Date.now() - 118_000));
  const view = render(<LiveJobsPage />);
  expect(screen.getByRole("button", { name: "Cooldown" })).toBeDisabled();
  expect(screen.getByText("0:02")).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(1000); });
  expect(screen.getByText("0:01")).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(1000); });
  expect(screen.getByRole("button", { name: "Refresh" })).toBeEnabled();
  view.unmount();
  expect(jest.getTimerCount()).toBe(0);

  localStorage.setItem("ff_live_last_search", String(Date.now()));
  const second = render(<LiveJobsPage />);
  expect(screen.getByRole("button", { name: "Cooldown" })).toBeDisabled();
  // Simulate a suspended browser tab: one tick must use elapsed wall time.
  jest.setSystemTime(Date.now() + 180_000);
  act(() => { jest.advanceTimersByTime(1000); });
  expect(screen.getByRole("button", { name: "Refresh" })).toBeEnabled();
  second.unmount();
  expect(jest.getTimerCount()).toBe(0);
});

it("cleans up an active cooldown on navigation", () => {
  jest.useFakeTimers();
  localStorage.setItem("ff_live_last_search", String(Date.now()));
  const view = render(<LiveJobsPage />);
  expect(jest.getTimerCount()).toBe(1);
  view.unmount();
  expect(jest.getTimerCount()).toBe(0);
});

it("sends 72 hours immediately when the empty-state action overrides a different range", async () => {
  (fetch as jest.Mock).mockImplementation(async url => json(url === "/api/leads/search" ? { leads: [lead] } : {}));
  render(<LiveJobsPage />);
  fireEvent.change(screen.getByLabelText("Posted within"), { target: { value: "720" } });
  fireEvent.click(screen.getByRole("button", { name: "Scan Last 72h" }));
  expect(await screen.findByText(lead.title)).toBeInTheDocument();
  const request = (fetch as jest.Mock).mock.calls.find(([url]) => url === "/api/leads/search");
  expect(JSON.parse(request![1].body)).toMatchObject({ maxHours: 72, minConfidence: 45 });
  expect(screen.getByLabelText("Posted within")).toHaveValue("72");
  expect(cached().maxHours).toBe(72);
});

it("retains the previous results and controls after a failed rescan", async () => {
  sessionStorage.setItem(key, JSON.stringify({ leads: [lead], selectedNiches: ["web-development"], maxHours: 168 }));
  (fetch as jest.Mock).mockImplementation(async url => url === "/api/leads/search" ? json({ error: "Source unavailable" }, false) : json({}));
  render(<LiveJobsPage />);
  fireEvent.click(await screen.findByRole("button", { name: "Scan 1 Niche · 7d" }));
  expect(await screen.findByText("Source unavailable")).toBeInTheDocument();
  expect(screen.getByText(lead.title)).toBeInTheDocument();
  expect(cached()).toMatchObject({ leads: [lead], selectedNiches: ["web-development"], maxHours: 168 });
});
