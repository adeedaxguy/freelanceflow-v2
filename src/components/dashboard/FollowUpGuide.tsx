"use client";

import { useId, useState } from "react";
import { Copy } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { meetingHandoffChecklist, REPLY_GUIDES } from "@/lib/outreach-readiness";

export default function FollowUpGuide({ company }: { company: string }) {
  const id = useId();
  const [intent, setIntent] = useState<keyof typeof REPLY_GUIDES>("interested");
  const [copyMessage, setCopyMessage] = useState("");
  const checklist = meetingHandoffChecklist(company);
  async function copyChecklist() {
    try { await copyText(checklist); setCopyMessage("Meeting checklist copied. No meeting has been booked."); }
    catch { setCopyMessage("Could not copy. The checklist below is still available to select."); }
  }
  return (
    <div className="grid min-w-0 gap-4 border-t border-border py-4 sm:grid-cols-2">
      <details className="min-w-0 text-sm">
        <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Reply next step</summary>
        <div className="mt-3 space-y-3">
          <label htmlFor={`${id}-intent`} className="block text-muted-foreground">Prospect&apos;s response</label>
          <select id={`${id}-intent`} value={intent} onChange={event => setIntent(event.target.value as keyof typeof REPLY_GUIDES)} className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground sm:text-sm">
            {Object.entries(REPLY_GUIDES).map(([value, guide]) => <option key={value} value={value}>{guide.label}</option>)}
          </select>
          <ol className="list-decimal space-y-2 pl-5 text-foreground" aria-live="polite">
            {REPLY_GUIDES[intent].steps.map(step => <li key={step}>{step}</li>)}
          </ol>
          <p className="text-xs text-muted-foreground">No message, schedule or pipeline status is changed.</p>
        </div>
      </details>
      <details className="min-w-0 text-sm">
        <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Meeting handoff</summary>
        <div className="mt-3 space-y-3">
          <label htmlFor={`${id}-handoff`} className="block text-muted-foreground">Internal preparation checklist</label>
          <textarea id={`${id}-handoff`} readOnly value={checklist} rows={8} className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-base leading-relaxed text-foreground sm:text-sm" />
          <button type="button" onClick={() => void copyChecklist()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Copy className="h-4 w-4" /> Copy meeting checklist</button>
          {copyMessage && <p role="status" className="text-xs text-muted-foreground">{copyMessage}</p>}
        </div>
      </details>
    </div>
  );
}
