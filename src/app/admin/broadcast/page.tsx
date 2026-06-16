"use client";

import { useState } from "react";
import { Megaphone, Users, CheckCircle, AlertTriangle, Send, RefreshCw } from "lucide-react";

const SEGMENTS = [
  { key: "all",    label: "All Users",    desc: "Every registered user on the platform" },
  { key: "free",   label: "Free Users",   desc: "Users on the free plan only" },
  { key: "pro",    label: "Pro Users",    desc: "Users on the Pro plan" },
  { key: "agency", label: "Agency Users", desc: "Users on the Agency plan" },
];

const TEMPLATES = [
  { label: "New Feature Announcement", subject: "🚀 New Feature: [Feature Name]", body: "Hi {name},\n\nWe've just launched [Feature Name] to help you [benefit]. Here's what's new:\n\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\nLog in to try it now.\n\nBest,\nThe iCloseLeads Team" },
  { label: "Upgrade Prompt", subject: "Unlock higher daily lead limits with iCloseLeads Pro", body: "Hi {name},\n\nYou've been using iCloseLeads and we've noticed you're hitting the free tier limits. Upgrade to Pro to unlock:\n\n• Higher daily lead limits\n• Unlimited AI proposals\n• Priority support\n\nUpgrade now → https://icloseleads.com/dashboard/upgrade\n\nBest,\nThe iCloseLeads Team" },
  { label: "Maintenance Notice", subject: "Scheduled maintenance — [Date]", body: "Hi {name},\n\nWe'll be performing scheduled maintenance on [Date] from [Time] to [Time] UTC. During this window, the platform may be briefly unavailable.\n\nWe apologize for any inconvenience.\n\nBest,\nThe iCloseLeads Team" },
];

export default function AdminBroadcastPage() {
  const [segment, setSegment]   = useState("all");
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [sending, setSending]   = useState(false);
  const [result, setResult]     = useState<{ count: number; segment: string } | null>(null);
  const [error, setError]       = useState("");

  async function send() {
    if (!subject.trim() || !message.trim()) { setError("Subject and message are required."); return; }
    setSending(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, segment }),
    });
    const d = await res.json() as { recipientCount?: number; segment?: string; error?: string };
    setSending(false);
    if (res.ok && d.recipientCount !== undefined) {
      setResult({ count: d.recipientCount, segment: d.segment ?? segment });
      setSubject("");
      setMessage("");
    } else {
      setError(d.error ?? "Broadcast failed.");
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Broadcast Message</h1>
        <p className="text-muted-foreground mt-1 text-sm">Send announcements, feature updates, or promotions to user segments.</p>
      </div>

      {result && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Broadcast logged successfully</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ready to send to <strong>{result.count}</strong> {result.segment} users.
              Connect Resend in Settings to deliver emails.
            </p>
          </div>
        </div>
      )}

      {/* Segment selector */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <h2 className="text-foreground font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-light" /> Target Segment
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {SEGMENTS.map(s => (
            <button key={s.key} onClick={() => setSegment(s.key)}
              className={`text-left p-4 rounded-xl border transition-all ${
                segment === s.key
                  ? "bg-primary/15 border-primary/50 text-primary-light"
                  : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}>
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick templates */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6">
        <h2 className="text-foreground font-semibold mb-4 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-accent" /> Quick Templates
        </h2>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(t => (
            <button key={t.label}
              onClick={() => { setSubject(t.subject); setMessage(t.body); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compose */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-foreground font-semibold flex items-center gap-2">
          <Send className="w-4 h-4 text-primary-light" /> Compose
        </h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. 🚀 New Feature: AI Deal Closer"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Message Body</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={10}
            placeholder="Write your message here. Use {name} to personalise with the user's name."
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm resize-none font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">Supports plain text. HTML will be stripped. Use {"{name}"} for personalisation.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Sending to: <strong className="text-foreground">{SEGMENTS.find(s => s.key === segment)?.label}</strong>
          </div>
          <button onClick={() => void send()} disabled={sending || !subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send Broadcast"}
          </button>
        </div>
      </div>
    </div>
  );
}
