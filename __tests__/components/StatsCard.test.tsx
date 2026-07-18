import React from "react";
import { render, screen } from "@testing-library/react";
import StatsCard from "@/components/StatsCard";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require("react");
      return React.createElement("div", props, children);
    },
  },
}));

describe("StatsCard", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Leads Found" value={42} />);
    expect(screen.getByText("Leads Found")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string values", () => {
    render(<StatsCard title="Open Rate" value="24%" />);
    expect(screen.getByText("24%")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<StatsCard title="Emails Sent" value={100} subtitle="This month" />);
    expect(screen.getByText("This month")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<StatsCard title="Emails Sent" value={100} />);
    expect(screen.queryByText("This month")).not.toBeInTheDocument();
  });

  it("renders positive trend with + sign", () => {
    render(<StatsCard title="Leads" value={50} trend={15} trendLabel="vs last month" />);
    expect(screen.getByText("+15%")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("renders negative trend without + sign", () => {
    render(<StatsCard title="Leads" value={50} trend={-5} />);
    expect(screen.getByText("-5%")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const Icon = () => <svg data-testid="test-icon" />;
    render(<StatsCard title="Test" value={1} icon={<Icon />} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies accent variant styling class", () => {
    const { container } = render(<StatsCard title="Test" value={1} variant="accent" />);
    expect(container.firstChild).toHaveClass("border-accent/20");
  });

  it("applies gold variant styling class", () => {
    const { container } = render(<StatsCard title="Test" value={1} variant="gold" />);
    expect(container.firstChild).toHaveClass("border-gold/20");
  });
});
