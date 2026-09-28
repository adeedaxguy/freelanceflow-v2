import { getOutreachReminders, meetingHandoffChecklist, REPLY_GUIDES } from "./outreach-readiness";

const draft = { email: "owner@example.com", subject: "Your booking page", body: "Would a short outline be useful?" };
it("does not label normal business mailboxes as verified or risky", () => {
  expect(getOutreachReminders(draft)).toEqual([]);
  expect(getOutreachReminders({ ...draft, email: "support@example.com" })).toEqual([]);
});
it.each(["privacy@trmlabs.com", "DPO@example.com", "no-reply@example.com", "legal+inbound@example.com", "security.team@example.com"])("flags unsuitable outreach mailbox %s", email => {
  expect(getOutreachReminders({ ...draft, email })).toEqual([expect.stringContaining("not a sales contact")]);
});
it("checks missing fields and invalid addresses without throwing", () => {
  expect(getOutreachReminders({ email: null, subject: " ", body: "" })).toHaveLength(3);
  expect(getOutreachReminders({ ...draft, email: "not-an-email" })).toEqual([expect.stringContaining("format")]);
});
it.each(["[Company]", "[Your Name]", "[Add one truthful example of your relevant work.]", "{{first_name}}"])("finds unfinished placeholder %s", body => {
  expect(getOutreachReminders({ ...draft, body })).toContain("Replace the remaining template placeholders with verified details.");
});
it("does not mistake ordinary bracketed dates for template fields", () => {
  expect(getOutreachReminders({ ...draft, body: "Would a [Q3] review help?" })).toEqual([]);
});
it("suggests one next step without editing the draft", () => {
  const input = { ...draft, body: "What is your budget? Can you meet today?" };
  expect(getOutreachReminders(input)).toContain("Consider one clear next-step question instead of several competing requests.");
  expect(input.body).toBe("What is your budget? Can you meet today?");
});
it("preserves an opt-out and never suggests another follow-up", () => {
  expect(REPLY_GUIDES.stop.steps[0]).toBe("Stop outreach to this contact.");
  expect(REPLY_GUIDES.stop.steps.join(" ")).toContain("Do not ask for a referral or schedule another message");
});
it("marks meeting details unconfirmed instead of inventing them", () => {
  expect(meetingHandoffChecklist(" Example ")).toContain("Meeting handoff: Example");
  expect(meetingHandoffChecklist("")).toContain("Meeting handoff: Prospect");
  expect(meetingHandoffChecklist("Example")).toContain("include only after booking is confirmed");
});
