"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Clock3, Lock, Plus, ShieldCheck, Trash2, Mail } from "lucide-react";
import { CampaignStatusBadge } from "@/components/Badge";
import ConfirmModal from "@/components/ConfirmModal";
import { formatDate } from "@/lib/utils";
import type { Campaign } from "@/types";

interface ApiResponse { campaigns: Campaign[]; }

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", niche: "" });
  const isAdmin = session?.user?.role === "ADMIN";

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/campaigns");
    if (res.ok) { const d = (await res.json()) as ApiResponse; setCampaigns(d.campaigns); }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchCampaigns(); }, [fetchCampaigns]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setCreating(false); setForm({ name: "", niche: "" }); void fetchCampaigns();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/campaigns?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null); void fetchCampaigns();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Organize leads, proposal drafts, and follow-ups. Sending still happens manually in Gmail.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all shadow-glow-primary">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className={`rounded-2xl border p-5 ${
        isAdmin
          ? "border-accent/25 bg-accent/5"
          : "border-gold/25 bg-gold/5"
      }`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${
              isAdmin
                ? "border-accent/25 bg-accent/10"
                : "border-gold/25 bg-gold/10"
            }`}>
              {isAdmin ? (
                <ShieldCheck className="w-5 h-5 text-accent" />
              ) : (
                <Clock3 className="w-5 h-5 text-gold" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-foreground font-semibold">
                  {isAdmin ? "Admin beta: bulk sending lab" : "Bulk email sending is coming soon"}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin ? "bg-accent/10 text-accent" : "bg-gold/10 text-gold"
                }`}>
                  {isAdmin ? "Admin only" : "Soon"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground max-w-3xl">
                Campaign organization is live. Automated bulk sending stays gated until
                review steps, daily caps, unsubscribe handling, bounced-message tracking,
                and abuse prevention are fully tested.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:min-w-[360px]">
            {[
              "Review first",
              "Rate limited",
              "Opt-out ready",
            ].map(item => (
              <div key={item} className="rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gradient-card border border-border rounded-2xl animate-pulse" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-2xl p-12 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-foreground font-medium mb-1">No campaigns yet</h3>
          <p className="text-muted-foreground text-sm">Create your first campaign to group leads and prepared outreach.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-gradient-card border border-border hover:border-primary/30 rounded-2xl p-5 flex items-center gap-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary-light" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="text-foreground font-semibold truncate">{c.name}</p>
                  <CampaignStatusBadge status={c.status} />
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">{c.emailCount} prepared item{c.emailCount === 1 ? "" : "s"} · Created {formatDate(c.createdAt)} {c.niche ? `· ${c.niche}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-card-hover">
            <h3 className="text-foreground font-semibold mb-4">New Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Campaign Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" placeholder="Q1 Web Dev Outreach" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Niche (optional)</label>
                <input value={form.niche} onChange={e => setForm({...form, niche: e.target.value})}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary/50" placeholder="web-development" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title="Delete Campaign" message="This campaign will be permanently deleted." onConfirm={() => void handleDelete()} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
