"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Inbox,
  Mail,
  PenLine,
  RefreshCw,
  Reply,
  Send,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MailboxMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  fromEmail: string;
  toEmail: string;
  subject: string;
  body: string;
  status: string;
  readAt: string | null;
  createdAt: string;
};

type MailboxData = {
  messages: MailboxMessage[];
  counts: { inbox: number; unread: number; sent: number; failed: number };
  sender: { configured: boolean; provider: "resend" | "smtp" | null; fromEmail: string };
};

type MailboxView = "inbox" | "sent";

const EMPTY_COUNTS = { inbox: 0, unread: 0, sent: 0, failed: 0 };

function formatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function normalizeReplySubject(subject: string) {
  return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
}

export default function AdminInboxPage() {
  const [data, setData] = useState<MailboxData | null>(null);
  const [view, setView] = useState<MailboxView>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const loadInbox = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/inbox", { cache: "no-store" });
      const payload = await response.json() as MailboxData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load the mailbox.");
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load the mailbox.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const visibleMessages = useMemo(() => {
    const direction = view === "inbox" ? "INBOUND" : "OUTBOUND";
    return data?.messages.filter((message) => message.direction === direction) ?? [];
  }, [data, view]);

  const selected = useMemo(
    () => data?.messages.find((message) => message.id === selectedId) ?? null,
    [data, selectedId],
  );

  function changeView(nextView: MailboxView) {
    setView(nextView);
    setSelectedId(null);
    setComposing(false);
  }

  async function selectMessage(message: MailboxMessage) {
    setSelectedId(message.id);
    setComposing(false);
    if (message.direction === "INBOUND" && !message.readAt) {
      setData((current) => current ? {
        ...current,
        messages: current.messages.map((item) => item.id === message.id ? { ...item, readAt: new Date().toISOString() } : item),
        counts: { ...current.counts, unread: Math.max(0, current.counts.unread - 1) },
      } : current);
      await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: message.id }),
      });
    }
  }

  function compose() {
    setSelectedId(null);
    setTo("");
    setSubject("");
    setBody("");
    setReplyToId(undefined);
    setComposing(true);
  }

  function reply(message: MailboxMessage) {
    setTo(message.fromEmail);
    setSubject(normalizeReplySubject(message.subject));
    setBody("");
    setReplyToId(message.id);
    setComposing(true);
  }

  async function sendEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, replyToId }),
      });
      const payload = await response.json() as { message?: MailboxMessage; error?: string };
      if (!response.ok || !payload.message) throw new Error(payload.error || "Email could not be sent.");
      setData((current) => current ? {
        ...current,
        messages: [payload.message!, ...current.messages],
        counts: { ...current.counts, sent: current.counts.sent + 1 },
      } : current);
      setView("sent");
      setSelectedId(payload.message.id);
      setComposing(false);
      setBody("");
      setReplyToId(undefined);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Email could not be sent.");
    } finally {
      setSending(false);
    }
  }

  const counts = data?.counts ?? EMPTY_COUNTS;
  const mailboxStats: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: "Inbox", value: counts.inbox, icon: Inbox },
    { label: "Unread", value: counts.unread, icon: Mail },
    { label: "Sent", value: counts.sent, icon: Send },
    { label: "Failed", value: counts.failed, icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Mailbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Receive and reply as {data?.sender.fromEmail || "hello@icloseleads.com"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadInbox(true)}
            title="Refresh mailbox"
            aria-label="Refresh mailbox"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={compose}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <PenLine className="h-4 w-4" /> Compose
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-4">
        {mailboxStats.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`p-4 ${index % 2 ? "border-l border-border" : ""} ${index > 1 ? "border-t border-border sm:border-t-0" : ""} ${index > 0 ? "sm:border-l sm:border-border" : ""}`}>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Icon className="h-4 w-4" /> {label}
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </section>

      {!loading && !data?.sender.configured && (
        <div className="flex gap-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-foreground">Mailbox setup is not complete</p>
            <p className="mt-1 text-sm text-muted-foreground">Verify the domain and connect the Resend credentials before sending.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} title="Dismiss" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="min-h-[560px] overflow-hidden rounded-xl border border-border bg-card lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className={`${selected || composing ? "hidden lg:block" : "block"} border-border lg:border-r`}>
          <div className="grid grid-cols-2 border-b border-border p-2">
            <button
              type="button"
              onClick={() => changeView("inbox")}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${view === "inbox" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              Inbox {counts.unread > 0 && <span className="ml-1">({counts.unread})</span>}
            </button>
            <button
              type="button"
              onClick={() => changeView("sent")}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${view === "sent" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              Sent
            </button>
          </div>

          <div className="max-h-[620px] overflow-y-auto">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading mailbox...</p>
            ) : visibleMessages.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Mail className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">No {view} messages</p>
                <p className="mt-1 text-xs text-muted-foreground">New messages will appear here automatically.</p>
              </div>
            ) : visibleMessages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => void selectMessage(message)}
                className={`w-full border-b border-border px-4 py-4 text-left transition-colors hover:bg-muted/70 ${selectedId === message.id ? "bg-muted" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className={`truncate text-sm text-foreground ${message.direction === "INBOUND" && !message.readAt ? "font-semibold" : "font-medium"}`}>
                    {message.direction === "INBOUND" ? message.fromEmail : message.toEmail}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-foreground">{message.subject}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{message.body}</p>
                {message.direction === "OUTBOUND" && (
                  <span className={`mt-2 inline-flex text-[11px] font-medium ${["FAILED", "BOUNCED", "COMPLAINED", "SUPPRESSED"].includes(message.status) ? "text-red-500" : "text-emerald-500"}`}>
                    {message.status.toLowerCase().replaceAll("_", " ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <main className={`${selected || composing ? "block" : "hidden lg:grid"} min-w-0 lg:place-items-center`}>
          {composing ? (
            <form onSubmit={sendEmail} className="w-full self-stretch p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setComposing(false)}
                    title="Back to messages"
                    aria-label="Back to messages"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{replyToId ? "Reply" : "New email"}</h2>
                    <p className="text-xs text-muted-foreground">From {data?.sender.fromEmail || "hello@icloseleads.com"}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setComposing(false)} title="Close composer" aria-label="Close composer" className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="mail-to" className="mb-2 block text-sm font-medium text-foreground">To</label>
                  <input id="mail-to" type="email" required value={to} onChange={(event) => setTo(event.target.value)} className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
                <div>
                  <label htmlFor="mail-subject" className="mb-2 block text-sm font-medium text-foreground">Subject</label>
                  <input id="mail-subject" required value={subject} onChange={(event) => setSubject(event.target.value)} className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
                <div>
                  <label htmlFor="mail-body" className="mb-2 block text-sm font-medium text-foreground">Message</label>
                  <textarea id="mail-body" required rows={14} value={body} onChange={(event) => setBody(event.target.value)} className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">Replies return to the corporate inbox.</p>
                <button type="submit" disabled={sending || !data?.sender.configured} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                  {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending" : "Send email"}
                </button>
              </div>
            </form>
          ) : selected ? (
            <article className="w-full self-stretch p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
                <div className="min-w-0">
                  <button type="button" onClick={() => setSelectedId(null)} className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground lg:hidden">
                    <ArrowLeft className="h-4 w-4" /> Messages
                  </button>
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{selected.subject}</h2>
                  <p className="mt-3 break-all text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{selected.direction === "INBOUND" ? "From" : "To"}:</span>{" "}
                    {selected.direction === "INBOUND" ? selected.fromEmail : selected.toEmail}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                {selected.direction === "INBOUND" && (
                  <button type="button" onClick={() => reply(selected)} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                    <Reply className="h-4 w-4" /> Reply
                  </button>
                )}
              </div>
              <div className="whitespace-pre-wrap break-words py-7 text-sm leading-7 text-foreground">{selected.body}</div>
              {selected.direction === "OUTBOUND" && (
                <div className="flex items-center gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Delivery status: {selected.status.toLowerCase().replaceAll("_", " ")}
                </div>
              )}
            </article>
          ) : (
            <div className="hidden px-6 text-center lg:block">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">Select a message</p>
              <p className="mt-1 text-xs text-muted-foreground">Read a conversation or compose a new email.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
