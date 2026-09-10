import { fireEvent, render, screen, waitFor } from "@testing-library/react";
jest.mock("@/components/Navbar", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/Footer", () => ({ __esModule: true, default: () => null }));
import ContactPage from "./page";

describe("public contact form", () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  const fill = () => {
    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Test Visitor" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "visitor@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Please help me with my account." } });
  };
  it("offers direct email and a form without sign-in", () => {
    render(<ContactPage />);
    expect(screen.getByRole("link", { name: "hello@icloseleads.com" })).toHaveAttribute("href", "mailto:hello@icloseleads.com");
    expect(screen.getByLabelText("Message")).toHaveAttribute("maxLength", "2000");
  });
  it("shows saved confirmation only after the server accepts the request", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    render(<ContactPage />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Request received"));
    expect(screen.getByRole("status")).toHaveTextContent("visitor@example.com");
  });
  it("preserves the message and displays a useful retry error", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ error: "Too many messages. Please try again later." }) });
    render(<ContactPage />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Too many messages"));
    expect(screen.getByLabelText("Message")).toHaveValue("Please help me with my account.");
    expect(screen.getByRole("button", { name: "Send Message" })).toBeEnabled();
  });
});
