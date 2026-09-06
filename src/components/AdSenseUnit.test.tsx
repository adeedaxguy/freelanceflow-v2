import { act, render, screen, waitFor } from "@testing-library/react";
import { useSession } from "next-auth/react";
jest.mock("next-auth/react", () => ({ useSession: jest.fn() }));
import {
  BlogInlineAd,
  DashboardOverviewAd,
  LeadResultsAd,
  MarketingAdBand,
} from "./AdSenseUnit";

function mockViewport(isMobile: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn().mockReturnValue({
      matches: isMobile,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
}

beforeEach(() => {
  (useSession as jest.Mock).mockReturnValue({ status: "authenticated", data: { user: { plan: "free", role: "USER" } } });
  jest.useRealTimers();
  window.adsbygoogle = [];
  mockViewport(false);
});

it.each(["pro", "agency"])("does not show lead-result ads to %s customers", plan => {
  (useSession as jest.Mock).mockReturnValue({ status: "authenticated", data: { user: { plan, role: "USER" } } });
  render(<LeadResultsAd />);
  expect(screen.queryByLabelText("Advertisement")).not.toBeInTheDocument();
  expect(window.adsbygoogle).toHaveLength(0);
});

it("uses the desktop in-feed unit after desktop hydration", async () => {
  mockViewport(false);
  render(<LeadResultsAd />);

  const ad = await screen.findByLabelText("Advertisement");
  expect(ad.querySelector("ins")).toHaveAttribute("data-ad-slot", "1014084754");
  expect(ad.querySelector("ins")).toHaveAttribute("data-ad-layout-key", "-ex+5g+64-d5+3t");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("uses the mobile in-feed unit after mobile hydration", async () => {
  mockViewport(true);
  render(<LeadResultsAd />);

  const ad = await screen.findByLabelText("Advertisement");
  expect(ad.querySelector("ins")).toHaveAttribute("data-ad-slot", "9482129532");
  expect(ad.querySelector("ins")).toHaveAttribute("data-ad-layout-key", "-6c+e7+1e-40+6x");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("uses a horizontal dashboard unit on desktop", async () => {
  mockViewport(false);
  render(<DashboardOverviewAd />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).toHaveAttribute("data-ad-slot", "1080749546");
  expect(ad).toHaveAttribute("data-ad-format", "horizontal");
  expect(ad).toHaveAttribute("data-full-width-responsive", "true");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("uses the responsive horizontal dashboard unit on mobile", async () => {
  mockViewport(true);
  render(<DashboardOverviewAd />);

  const ad = await screen.findByLabelText("Advertisement");
  expect(ad.querySelector("ins")).toHaveAttribute("data-ad-slot", "1080749546");
  expect(ad.querySelector("ins")).toHaveAttribute("data-ad-format", "horizontal");
  expect(ad.querySelector("ins")).toHaveAttribute("data-full-width-responsive", "true");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("uses a horizontal display unit on public marketing pages", async () => {
  mockViewport(false);
  render(<MarketingAdBand />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).toHaveAttribute("data-ad-slot", "1080749546");
  expect(ad).toHaveAttribute("data-ad-format", "horizontal");
  expect(ad).toHaveAttribute("data-full-width-responsive", "true");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("uses the mobile in-feed unit inside blog articles on phones", async () => {
  mockViewport(true);
  render(<BlogInlineAd />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).toHaveAttribute("data-ad-slot", "9482129532");
  expect(ad).toHaveAttribute("data-ad-format", "fluid");
  expect(ad).toHaveAttribute("data-ad-layout-key", "-6c+e7+1e-40+6x");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("uses the desktop in-feed unit inside blog articles on larger screens", async () => {
  mockViewport(false);
  render(<BlogInlineAd />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).toHaveAttribute("data-ad-slot", "1014084754");
  expect(ad).toHaveAttribute("data-ad-format", "fluid");
  expect(ad).toHaveAttribute("data-ad-layout-key", "-ex+5g+64-d5+3t");
  await waitFor(() => expect(window.adsbygoogle).toHaveLength(1));
});

it("collapses the ad shell when AdSense reports no fill", async () => {
  render(<BlogInlineAd />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).not.toBeNull();

  act(() => {
    ad?.setAttribute("data-ad-status", "unfilled");
  });

  await waitFor(() => {
    expect(screen.queryByLabelText("Advertisement")).not.toBeInTheDocument();
  });
});

it("collapses a blank ad frame unless AdSense marks it filled", () => {
  jest.useFakeTimers();
  render(<BlogInlineAd />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).not.toBeNull();

  act(() => {
    ad?.appendChild(document.createElement("iframe"));
    jest.advanceTimersByTime(4600);
  });

  expect(screen.queryByLabelText("Advertisement")).not.toBeInTheDocument();
});

it("collapses an ad shell that never receives a fill signal", () => {
  jest.useFakeTimers();
  render(<BlogInlineAd />);

  expect(screen.getByLabelText("Advertisement")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(4600);
  });

  expect(screen.queryByLabelText("Advertisement")).not.toBeInTheDocument();
});

it("keeps the ad creative hidden until AdSense reports a real fill", async () => {
  render(<BlogInlineAd />);

  const ad = screen.getByLabelText("Advertisement").querySelector("ins");
  expect(ad).not.toBeNull();
  expect(ad).toHaveClass("opacity-0");

  act(() => {
    ad?.setAttribute("data-ad-status", "filled");
  });

  await waitFor(() => {
    expect(ad).toHaveClass("opacity-100");
  });
});
