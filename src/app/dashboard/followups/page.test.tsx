import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import FollowUpsPage from "./page";
const followUp = { id: "followup-1", leadId: "lead-1", step: 1, subject: "Original subject", body: "Original body for this follow up.", status: "PENDING", scheduledAt: "2026-09-12", sentAt: null, lead: { company: "Example", email: "person@example.com", domain: "example.com" } };
const json = (body: unknown, ok = true) => ({ ok, json: async () => body });
beforeEach(() => {
  AbortSignal.timeout ??= () => new AbortController().signal;
  global.fetch = jest.fn();
  (fetch as jest.Mock).mockImplementation(async (url, options) => options?.method ? json({ error: "Save unavailable" }, false) : json(String(url).includes("/api/followup") ? { followUps: [followUp] } : { leads: [{ id: "lead-1", company: "Example" }] }));
});
it("reports failed loads instead of showing a fake empty list", async () => {
  (fetch as jest.Mock).mockResolvedValue(json({ error: "Load unavailable" }, false));
  render(<FollowUpsPage />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Load unavailable");
  expect(screen.queryByText("No follow-ups planned")).not.toBeInTheDocument();
});
it("does not autosave on blur and keeps edits after a failed save", async () => {
  render(<FollowUpsPage />);
  fireEvent.click(await screen.findByRole("button", { name: "Edit follow-up" }));
  const subject = screen.getByLabelText("Edit subject");
  fireEvent.change(subject, { target: { value: "My updated subject" } });
  fireEvent.blur(subject);
  expect((fetch as jest.Mock).mock.calls.filter(call => call[1]?.method === "PATCH")).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Save unavailable"));
  expect(subject).toHaveValue("My updated subject");
  expect(screen.getByLabelText("Edit body")).toHaveValue(followUp.body);
});
it("does not hide a follow-up when deletion fails", async () => {
  render(<FollowUpsPage />);
  fireEvent.click(await screen.findByRole("button", { name: "Delete follow-up" }));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Confirm" }));
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveTextContent("Save unavailable"));
  expect(screen.getByText("Original subject")).toBeInTheDocument();
});
it("marks a draft prepared only after its status is saved and never sends email", async () => {
  const composeWindow = { location: { href: "" }, close: jest.fn() };
  const open = jest.spyOn(window, "open").mockReturnValue(composeWindow as unknown as Window);
  (fetch as jest.Mock).mockImplementation(async (url, options) => {
    if (String(url).includes("/api/email/prepare")) return json({ composeUrl: "https://mail.google.com/mail/u/0/?view=cm" });
    if (options?.method) return json({ error: "Status unavailable" }, false);
    return json(String(url).includes("/api/followup") ? { followUps: [followUp] } : { leads: [] });
  });
  render(<FollowUpsPage />);
  fireEvent.click(await screen.findByRole("button", { name: "Prepare in Gmail" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("could not record"));
  expect(screen.getByText("PENDING")).toBeInTheDocument();
  expect(composeWindow.close).not.toHaveBeenCalled();
  expect(JSON.stringify((fetch as jest.Mock).mock.calls)).not.toContain('"SENT"');
  open.mockRestore();
});
