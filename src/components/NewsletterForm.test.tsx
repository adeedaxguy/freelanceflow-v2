import { fireEvent, render, screen } from "@testing-library/react";
import NewsletterForm from "./NewsletterForm";
beforeEach(() => { global.fetch = jest.fn(); AbortSignal.timeout ??= () => new AbortController().signal; });
it("shows confirmation instructions only after a successful request", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ message: "Check your inbox to confirm." }) });
  render(<NewsletterForm topic="status" />);
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "reader@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Check your inbox to confirm.");
  expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)).toEqual({ email: "reader@example.com", topic: "status", consent: true });
});
it("retains the address and consent when delivery fails", async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ error: "Confirmation unavailable" }) });
  render(<NewsletterForm topic="updates" />);
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "reader@example.com" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Confirmation unavailable");
  expect(screen.getByLabelText("Email address")).toHaveValue("reader@example.com");
  expect(screen.getByRole("checkbox")).toBeChecked();
  expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled();
});
