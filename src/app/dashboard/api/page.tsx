"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Code2, Copy, ExternalLink, KeyRound, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { copyText } from "@/lib/clipboard";

const SCOPE_LABELS: Record<string, string> = {
  "local-businesses:read": "Local businesses",
  "remote-jobs:read": "Remote jobs",
  "live-jobs:read": "Live jobs",
};

type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  requestsToday: number;
  totalRequests: number;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type ApiKeyData = {
  eligible: boolean;
  dailyLimit: number;
  availableScopes: string[];
  keys: ApiKeyRecord[];
};

export default function DeveloperApiPage() {
  const [data, setData] = useState<ApiKeyData | null>(null);
  const [name, setName] = useState("Production");
  const [scopes, setScopes] = useState<string[]>([]);
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/user/api-keys", { cache: "no-store" });
    const next = await response.json() as ApiKeyData & { error?: string };
    if (!response.ok) throw new Error(next.error ?? "Could not load API keys.");
    setData(next);
    setScopes(current => current.length ? current : next.availableScopes);
  }, []);

  useEffect(() => {
    load().catch(err => setError(err instanceof Error ? err.message : "Could not load API keys."));
  }, [load]);

  async function createKey() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scopes }),
      });
      const result = await response.json() as { key?: string; error?: string };
      if (!response.ok || !result.key) throw new Error(result.error ?? "Could not create API key.");
      setSecret(result.key);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create API key.");
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey(id: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/user/api-keys/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error ?? "Could not revoke API key.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke API key.");
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    await copyText(secret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-light">Developer tools</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground">
            <Code2 className="h-6 w-6 text-accent" /> iCloseLeads API
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Use local business, remote job, and live job data in your own server-side workflows.
          </p>
        </div>
        <Link href="/developers" target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-primary">
          Read API docs <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      {error && <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      {!data ? (
        <div className="flex min-h-48 items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : !data.eligible ? (
        <section className="border border-border bg-surface p-5 sm:p-6">
          <KeyRound className="h-7 w-7 text-primary-light" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">API access is available on Agency</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Agency accounts can create scoped keys with a 250-request daily allowance. Dashboard searches continue to work normally on your current plan.
          </p>
          <Link href="/dashboard/upgrade" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">
            View Agency access
          </Link>
        </section>
      ) : (
        <>
          <section className="border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-semibold text-foreground"><Plus className="h-4 w-4 text-accent" /> Create an API key</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose only the data this integration needs. The secret is shown once.</p>
              </div>
              <div className="text-sm text-muted-foreground"><strong className="text-foreground">{data.dailyLimit}</strong> requests / UTC day</div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Key name</span>
                  <input value={name} onChange={event => setName(event.target.value)} maxLength={50} className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </label>
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Scopes</legend>
                  <div className="flex flex-wrap gap-2">
                    {data.availableScopes.map(scope => {
                      const selected = scopes.includes(scope);
                      return (
                        <button key={scope} type="button" onClick={() => setScopes(current => selected ? current.filter(item => item !== scope) : [...current, scope])} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium ${selected ? "border-primary bg-primary/10 text-primary-light" : "border-border bg-background text-muted-foreground"}`}>
                          {selected && <Check className="h-3.5 w-3.5" />} {SCOPE_LABELS[scope] ?? scope}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
              <button type="button" onClick={createKey} disabled={busy || name.trim().length < 2 || !scopes.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Create key
              </button>
            </div>
          </section>

          {secret && (
            <section className="border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-amber-400" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">Copy this key now</h2>
                  <p className="mt-1 text-sm text-muted-foreground">For security, iCloseLeads cannot show it again.</p>
                  <div className="mt-3 flex gap-2">
                    <code className="min-w-0 flex-1 overflow-x-auto border border-border bg-background px-3 py-2.5 text-sm text-foreground">{secret}</code>
                    <button type="button" onClick={copySecret} title="Copy API key" className="inline-flex h-10 w-10 flex-none items-center justify-center border border-border bg-background text-foreground">
                      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Your keys</h2>
              <span className="text-xs text-muted-foreground">Maximum 5 active keys</span>
            </div>
            <div className="divide-y divide-border">
              {data.keys.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No API keys yet.</p>}
              {data.keys.map(key => (
                <div key={key.id} className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${key.revokedAt ? "opacity-50" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-foreground">{key.name}</strong>
                      <code className="text-xs text-muted-foreground">{key.prefix}</code>
                      {key.revokedAt && <span className="text-xs font-semibold text-red-400">Revoked</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{key.scopes.map(scope => SCOPE_LABELS[scope] ?? scope).join(" · ")} · {key.requestsToday} today · {key.totalRequests} total</p>
                  </div>
                  {!key.revokedAt && (
                    <button type="button" onClick={() => revokeKey(key.id)} disabled={busy} title="Revoke API key" className="inline-flex h-9 items-center justify-center gap-2 border border-red-500/20 px-3 text-xs font-semibold text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-3.5 w-3.5" /> Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
