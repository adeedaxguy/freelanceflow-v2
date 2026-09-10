"use client";

import { useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { requestJson } from "@/lib/client-request";

export default function NewsletterForm({ topic }: { topic: "updates" | "status" }) {
  const id = useId();
  const lock = useRef(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return <form className="mx-auto max-w-md space-y-3 text-left" onSubmit={async event => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const data = await requestJson<{ message: string }>("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, topic, consent }) });
      setMessage(data.message);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not subscribe. Please retry.");
    } finally { lock.current = false; setBusy(false); }
  }}>
    <label htmlFor={id} className="block text-sm font-medium">Email address</label>
    <div className="flex flex-col gap-2 sm:flex-row">
      <input id={id} type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground" />
      <button disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit">{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{busy ? "Sending" : "Subscribe"}</button>
    </div>
    <label className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" />I agree to receive {topic === "status" ? "service status notices" : "product updates and growth tips"} from iCloseLeads. Unsubscribe anytime.</label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {message && <p role="status" className="text-sm text-foreground">{message}</p>}
  </form>;
}
