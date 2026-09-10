"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export default function AIConnectionCheck() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function check() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai-check", { method: "POST", signal: AbortSignal.timeout(35000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Connection check failed. Please retry.");
      setMessage(`${data.connected ? `Connected to ${data.provider}.` : "No AI provider is responding successfully."} ${data.failures.map((f: { provider: string; reason: string; status?: number }) => `${f.provider}: ${f.reason.replaceAll("_", " ")}${f.status ? ` (${f.status})` : ""}`).join(". ")}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to check AI."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-2">
    <button type="button" disabled={loading} onClick={() => void check()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {loading ? "Checking AI..." : "Test AI connection"}
    </button>
    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
  </div>;
}
