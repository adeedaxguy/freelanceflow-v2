import { render, screen } from "@testing-library/react";
import UpgradeClient from "./UpgradeClient";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

const baseProps = {
  userEmail: "buyer@example.com",
  billingReady: true,
  billingTestMode: false,
  canCheckout: true,
  hasBillingSubscription: true,
  checkoutReturned: false,
  pricing: {
    proPrice: "29",
    agencyPrice: "79",
    proLeads: "1,000",
    agencyLeads: "Unlimited",
  },
};

describe("UpgradeClient", () => {
  it("does not offer a lower-tier checkout to an Agency customer", () => {
    render(<UpgradeClient {...baseProps} currentPlan="agency" />);

    expect(screen.getByText("Included in your Agency plan")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upgrade to Pro" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage billing" })).toBeInTheDocument();
  });

  it("offers Agency as an upgrade from Pro", () => {
    render(<UpgradeClient {...baseProps} currentPlan="pro" />);

    expect(screen.getByRole("button", { name: /Upgrade to Agency/ })).toBeEnabled();
  });
});
