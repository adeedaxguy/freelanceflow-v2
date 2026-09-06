import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpgradeClient from "./UpgradeClient";

jest.mock("next/navigation", () => ({ useRouter: () => mockRouter }));
jest.mock("@/lib/analytics", () => ({ trackAnalyticsEvent: jest.fn() }));
const mockRouter = { refresh: jest.fn() };
const props = {
  currentPlan: "free", userEmail: "test@example.com",
  billingReady: true, billingTestMode: false, canCheckout: true,
  hasBillingSubscription: false, checkoutReturned: false, checkoutCancelled: false,
  pricing: { proPrice: "10", agencyPrice: "15", proLeads: "1,000", agencyLeads: "Unlimited" },
};

describe("upgrade experience", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; jest.clearAllMocks(); });

  it("keeps a cancelled checkout separate from an error and offers the actual prices", () => {
    render(<UpgradeClient {...props} checkoutCancelled />);
    expect(screen.getByRole("status")).toHaveTextContent("You returned from checkout");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("$15")).toBeInTheDocument();
  });

  it("prevents another checkout while activation is pending", () => {
    render(<UpgradeClient {...props} checkoutReturned selectedPlan="agency" />);
    expect(screen.getByRole("status")).toHaveTextContent("Waiting for Stripe");
    for (const button of screen.getAllByRole("button", { name: "Awaiting confirmation" })) {
      expect(button).toBeDisabled();
    }
  });

  it("does not offer a lower-tier checkout to an Agency customer", () => {
    render(<UpgradeClient {...props} currentPlan="agency" hasBillingSubscription />);
    expect(screen.getByText("Included in your Agency plan")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upgrade to Pro" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage billing" })).toBeInTheDocument();
  });

  it("offers Agency as an upgrade from Pro", () => {
    render(<UpgradeClient {...props} currentPlan="pro" />);
    expect(screen.getByRole("button", { name: "Upgrade to Agency" })).toBeEnabled();
  });

  it("shows checkout errors without losing the selected plan", async () => {
    const request = jest.fn(async () => ({ status: 502, json: async () => ({ error: "Could not start secure checkout. Please try again." }) }));
    global.fetch = request as unknown as typeof fetch;
    render(<UpgradeClient {...props} selectedPlan="agency" />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade to Agency" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not start secure checkout"));
    expect(request).toHaveBeenCalledWith("/api/user/upgrade", expect.objectContaining({
      method: "POST", body: JSON.stringify({ plan: "agency", billing: "monthly" }),
    }));
    expect(screen.getByRole("button", { name: "Upgrade to Agency" })).toBeEnabled();
  });
});
