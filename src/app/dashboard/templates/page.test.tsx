import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import TemplatesPage from "./page";
const json = (body: unknown, ok = true) => ({ ok, json: async () => body });
beforeEach(() => { global.fetch = jest.fn(); AbortSignal.timeout ??= () => new AbortController().signal; });
it("recovers from a failed load and keeps built-ins beside custom templates", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(json({ error: "Temporary outage" }, false)).mockResolvedValueOnce(json({ templates: [{ id: "custom", name: "My template", subject: "A subject", body: "Saved draft", isDefault: false }] }));
  render(<TemplatesPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Temporary outage");
  fireEvent.click(screen.getByRole("button", { name: "Retry loading" }));
  expect(await screen.findByText("My template")).toBeInTheDocument();
  expect(screen.getByText("Web Dev Outreach")).toBeInTheDocument();
});
it("preserves a template and leaves its confirmation open when delete fails", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(json({ templates: [{ id: "custom", name: "My template", subject: "A subject", body: "Saved draft", isDefault: false }] })).mockResolvedValueOnce(json({ error: "Delete unavailable" }, false));
  render(<TemplatesPage />);
  fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveTextContent("Delete unavailable"));
  expect(screen.getByText("My template")).toBeInTheDocument();
});
it("keeps an unsaved draft when creation fails", async () => {
  (fetch as jest.Mock).mockResolvedValueOnce(json({ templates: [] })).mockResolvedValueOnce(json({ error: "Could not save draft" }, false));
  render(<TemplatesPage />);
  await screen.findByText("Web Dev Outreach");
  fireEvent.click(screen.getByRole("button", { name: "New Template" }));
  fireEvent.change(screen.getByLabelText("Template Name"), { target: { value: "My draft" } });
  fireEvent.change(screen.getByLabelText("Subject Line"), { target: { value: "A useful subject" } });
  fireEvent.change(screen.getByLabelText("Template Body"), { target: { value: "My original draft text" } });
  fireEvent.click(screen.getByRole("button", { name: "Save Template" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not save draft");
  expect(screen.getByLabelText("Template Body")).toHaveValue("My original draft text");
});
