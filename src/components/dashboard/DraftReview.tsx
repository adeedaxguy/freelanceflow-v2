import { getOutreachReminders } from "@/lib/outreach-readiness";

export default function DraftReview(props: { email?: string | null; subject: string; body: string }) {
  const reminders = getOutreachReminders(props);
  return (
    <details className="min-w-0 border-t border-border pt-3 text-sm">
      <summary className="cursor-pointer rounded-sm text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
        Draft check{reminders.length ? ` (${reminders.length} reminders)` : ""}
      </summary>
      <div className="mt-3 space-y-2 break-words text-foreground">
        {reminders.length > 0 ? (
          <ul className="list-disc space-y-2 pl-5">{reminders.map(reminder => <li key={reminder}>{reminder}</li>)}</ul>
        ) : <p>No basic issues found. Confirm the recipient, source and claims before outreach.</p>}
        <p className="text-xs text-muted-foreground">Advisory only. This does not verify deliverability, consent or the accuracy of your claims.</p>
      </div>
    </details>
  );
}
