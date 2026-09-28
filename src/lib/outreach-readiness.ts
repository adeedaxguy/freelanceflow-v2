import { z } from "zod";

export function getOutreachReminders(input: { email?: string | null; subject: string; body: string }) {
  const reminders: string[] = [];
  const email = input.email?.trim() || "";
  if (!email) reminders.push("No recipient email. Use the source's application or contact route, or verify a business contact first.");
  else if (!z.string().email().safeParse(email).success) reminders.push("Check the recipient email format.");
  else {
    const mailbox = email.split("@")[0]!.split("+")[0]!.toLowerCase().replace(/[._-]/g, "");
    if (/^(privacy|dpo|gdpr|legal|abuse|security|noreply|donotreply)(office|team)?$/.test(mailbox)) {
      reminders.push("This looks like a privacy, legal, security or no-reply inbox, not a sales contact. Verify a suitable recipient before outreach.");
    }
  }
  if (!input.subject.trim()) reminders.push("Add a specific subject before preparing email.");
  if (!input.body.trim()) reminders.push("Add your message before preparing email.");
  const text = `${input.subject}\n${input.body}`;
  if (/\{\{[^{}]+\}\}|\[(?:company\b|your\b|niche\b|benefit\b|specific\b|add\b|insert\b|name\b|service\b)[^\]\n]*\]/i.test(text)) {
    reminders.push("Replace the remaining template placeholders with verified details.");
  }
  if ((input.body.match(/\?/g) || []).length > 1) reminders.push("Consider one clear next-step question instead of several competing requests.");
  return reminders;
}

export const REPLY_GUIDES = {
  interested: { label: "Interested", steps: ["Acknowledge the outcome they want in their own words.", "Ask for the one missing detail needed to scope the work.", "Offer one next step; confirm the date and time zone before booking."] },
  question: { label: "Asked a question", steps: ["Answer their exact question first.", "Use only approved prices and evidence you can show; say what still needs checking.", "Ask one short question that moves the decision forward."] },
  later: { label: "Not now", steps: ["Acknowledge the timing without adding pressure.", "Ask whether a specific later date would be welcome.", "Only schedule another follow-up if they agree; cancel any outdated draft manually."] },
  wrong_person: { label: "Wrong person", steps: ["Thank them and ask whether they can point you to the appropriate business contact.", "Verify the new person's role and contact route before writing.", "Keep their reply as context; do not imply they endorsed your service."] },
  stop: { label: "Not interested / stop", steps: ["Stop outreach to this contact.", "Cancel outstanding follow-up drafts and record the request in your existing lead notes.", "Do not ask for a referral or schedule another message."] },
} as const;

export function meetingHandoffChecklist(company: string) {
  return [
    `Meeting handoff: ${company.trim() || "Prospect"}`,
    "Prospect's stated goal: [confirm from their reply]",
    "Original signal and source URL: [verify and include date checked]",
    "Main question or objection: [quote accurately]",
    "Agreed scope: [confirm; do not assume]",
    "Approved price, if discussed: [confirm; otherwise not discussed]",
    "Attendees and decision-maker role: [confirm]",
    "Next step, owner, date and time zone: [confirm]",
    "Meeting link: [include only after booking is confirmed]",
    "Outstanding questions: [list for the meeting]",
  ].join("\n");
}
