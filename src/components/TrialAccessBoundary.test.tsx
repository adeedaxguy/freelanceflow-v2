import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import TrialAccessBoundary, { type TrialUsage } from "./TrialAccessBoundary";

let mockPathname = "/dashboard";
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
const usage: TrialUsage = { plan: "free", remaining: 450, trialExpired: false, trialEndsAt: "2026-09-13T12:00:00Z", unlimited: false };
beforeEach(() => {
  mockPathname = "/dashboard";
  jest.useFakeTimers().setSystemTime(new Date("2026-09-12T12:00:00Z"));
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => usage });
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

it("shows the shared allowance, exact deadline and upgrade link", async () => {
  render(<TrialAccessBoundary initialUsage={usage}>Saved work</TrialAccessBoundary>);
  expect(screen.getByText(/24 hours left/)).toBeInTheDocument();
  expect(screen.getByText(/450 lead results remaining across Local, Remote, and Live Jobs/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View paid plans" })).toHaveAttribute("href", "/dashboard/upgrade");
  await act(async () => {});
});

it("switches to expiry at the deadline without losing saved work", async () => {
  jest.setSystemTime(new Date("2026-09-13T11:59:59Z"));
  render(<TrialAccessBoundary initialUsage={usage}>Saved work</TrialAccessBoundary>);
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.getByText("Your 3-day trial has ended")).toBeInTheDocument();
  expect(screen.getByText("Saved work")).toBeInTheDocument();
});

it("blocks new website design after expiry", async () => {
  mockPathname = "/dashboard/web-design";
  jest.setSystemTime(new Date("2026-09-14T12:00:00Z"));
  render(<TrialAccessBoundary initialUsage={usage}>Design editor</TrialAccessBoundary>);
  expect(screen.queryByText("Design editor")).not.toBeInTheDocument();
  expect(screen.getByText("Continue creating website concepts")).toBeInTheDocument();
  await act(async () => {});
});

it("refreshes the banner after a paid upgrade", async () => {
  render(<TrialAccessBoundary initialUsage={usage}>Saved work</TrialAccessBoundary>);
  await act(async () => {});
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ ...usage, plan: "pro", trialEndsAt: null }) });
  fireEvent.focus(window);
  await waitFor(() => expect(screen.queryByLabelText("Trial status")).not.toBeInTheDocument());
  expect(screen.getByText("Saved work")).toBeInTheDocument();
});
