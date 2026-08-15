"use client";

import { useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";

export default function MarketingEmailOptIn() {
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function enable() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/user/email-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingConsent: true }),
      });
      if (!response.ok) throw new Error("Could not update your email preference.");
      setEnabled(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update your email preference.");
    } finally {
      setSaving(false);
    }
  }

  if (enabled) {
    return (
      <div className="dashboard-surface flex items-center gap-3 px-4 py-3 text-sm text-foreground">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        Product emails are enabled. You will receive important feature and lead-allowance updates.
      </div>
    );
  }

  return (
    <div className="dashboard-surface flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" />
        <div>
          <p className="text-sm font-semibold text-foreground">Keep up with iCloseLeads improvements</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Get occasional lead-allowance updates, new workflow releases, and practical client-acquisition tips. Unsubscribe anytime.
          </p>
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void enable()}
        disabled={saving}
        className="h-10 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Enabling..." : "Enable product emails"}
      </button>
    </div>
  );
}
