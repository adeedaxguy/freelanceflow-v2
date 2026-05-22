"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Plus, Play, Pause, Trash2, Mail } from "lucide-react";
import { CampaignStatusBadge } from "@/components/Badge";
import ConfirmModal from "@/components/ConfirmModal";
import { formatDate } from "@/lib/utils";
import type { Campaign } from "@/types";

interface ApiResponse { campaigns: Campaign[]; }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", niche: "" });

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

  async function toggleStatus(campaign: Campaign) {
    const newStatus = campaign.status === "RUNNING" ? "DRAFT" : campaign.status === "DRAFT" ? "RUNNING" : "COMPLETED";
    await fetch("/api/campaigns", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: campaign.id, status: newStatus }) });
    void fetchCampaigns();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/campaigns?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null); void fetchCampaigns();
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">Organize your outreach into campaigns.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all shadow-glow-primary">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gradient-card border border-border rounded-2xl animate-pulse" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-2xl p-12 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-foreground font-medium mb-1">No campaigns yet</h3>
          <p className="text-muted-foreground text-sm">Create your first campaign to organize your outreach.</p>
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
                <p className="text-muted-foreground text-xs mt-0.5">{c.emailCount} emails · Created {formatDate(c.createdAt)} {c.niche ? `· ${c.niche}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                {c.status !== "COMPLETED" && (
                  <button onClick={() => void toggleStatus(c)}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors" title={c.status === "RUNNING" ? "Pause" : "Start"}>
                    {c.status === "RUNNING" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}
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
