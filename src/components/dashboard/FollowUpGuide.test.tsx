import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FollowUpGuide from "./FollowUpGuide";
import DraftReview from "./DraftReview";
import { copyText } from "@/lib/clipboard";

jest.mock("@/lib/clipboard", () => ({ copyText: jest.fn() }));
beforeEach(() => jest.clearAllMocks());
it("starts collapsed and changes guidance without a network request", () => {
  const originalFetch = global.fetch;
  global.fetch = jest.fn();
  const { container } = render(<FollowUpGuide company="Example" />);
  expect([...container.querySelectorAll("details")].every(item => !item.open)).toBe(true);
  fireEvent.click(screen.getByText("Reply next step"));
  fireEvent.change(screen.getByLabelText("Prospect's response"), { target: { value: "stop" } });
  expect(screen.getByText("Stop outreach to this contact.")).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
  global.fetch = originalFetch;
});
it("copies an internal checklist without claiming a meeting is booked", async () => {
  (copyText as jest.Mock).mockResolvedValue(undefined);
  render(<FollowUpGuide company="Example" />);
  fireEvent.click(screen.getByText("Meeting handoff"));
  fireEvent.click(screen.getByRole("button", { name: "Copy meeting checklist" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("No meeting has been booked"));
  expect(copyText).toHaveBeenCalledWith(expect.stringContaining("Meeting handoff: Example"));
});
it("keeps the checklist accessible after a clipboard failure", async () => {
  (copyText as jest.Mock).mockRejectedValue(new Error("Denied"));
  render(<FollowUpGuide company="Example" />);
  fireEvent.click(screen.getByText("Meeting handoff"));
  fireEvent.click(screen.getByRole("button", { name: "Copy meeting checklist" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Could not copy"));
  expect((screen.getByLabelText("Internal preparation checklist") as HTMLTextAreaElement).value).toContain("Example");
});
it("renders untrusted company names as plain text", () => {
  const { container } = render(<FollowUpGuide company={'<img src=x onerror="alert(1)">'} />);
  expect(container.querySelector("img")).toBeNull();
});
it("is advisory and never introduces send controls", () => {
  render(<DraftReview email="privacy@example.com" subject="Hi [Company]" body="Hello" />);
  fireEvent.click(screen.getByText("Draft check (2 reminders)"));
  expect(screen.getByText(/not a sales contact/)).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
