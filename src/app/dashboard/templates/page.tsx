"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Plus, Eye, Trash2, Layout, Sparkles } from "lucide-react";
import { NICHES } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";
import { Badge } from "@/components/Badge";

interface Template { id: string; name: string; niche: string | null; subject: string; body: string; isDefault: boolean; createdAt: string; }

const DEFAULT_TEMPLATES: Omit<Template, "id" | "createdAt">[] = [
  { name: "Web Dev Outreach", niche: "web-development", isDefault: true, subject: "Quick idea for {{company}}'s website", body: "Hi {{name}},\n\nI noticed {{company}} is growing fast — congrats! I'm a frontend developer who helps SaaS companies improve their web performance and UI.\n\nI recently helped a similar company cut their page load time by 60%, which drove a 12% increase in trial signups.\n\nWould a 15-minute chat make sense to explore if there's a fit?\n\nBest,\n{{your_name}}" },
  { name: "Design Agency Pitch", niche: "ui-ux-design", isDefault: true, subject: "Design audit idea for {{company}}", body: "Hi {{name}},\n\nI'm a UI/UX designer who helps companies reduce churn by improving their onboarding experience.\n\nI took a quick look at {{company}} and have a few ideas that could improve your activation rate.\n\nOpen to a quick 15-min call this week?\n\n{{your_name}}" },
  { name: "Copywriting Intro", niche: "copywriting", isDefault: true, subject: "{{company}}'s homepage copy — a thought", body: "Hi {{name}},\n\nI'm a B2B copywriter who helps SaaS companies clarify their messaging so more visitors convert.\n\nI had a look at {{company}}'s homepage — I think there's a real opportunity to sharpen the value prop above the fold.\n\nWould love to share a few specific ideas. Worth a quick call?\n\n{{your_name}}" },
  { name: "SEO Outreach", niche: "seo", isDefault: true, subject: "{{company}}'s organic traffic opportunity", body: "Hi {{name}},\n\nI specialize in SEO for B2B SaaS companies. I ran a quick analysis of {{company}}'s keyword landscape and spotted some quick-win opportunities.\n\nRecently helped a similar company grow organic traffic 180% in 6 months.\n\nWorth a 15-minute call to walk through what I found?\n\n{{your_name}}" },
  { name: "Email Marketing", niche: "email-marketing", isDefault: true, subject: "Revenue your email list is leaving on the table", body: "Hi {{name}},\n\nI'm an email marketing strategist who helps e-commerce brands get more revenue from their existing list — without sending more emails.\n\nI've seen brands like {{company}} add $30–80k/month just by improving their flow structure.\n\nHappy to share a quick audit if you're interested?\n\n{{your_name}}" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: "", niche: "", subject: "", body: "" });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/templates");
    if (res.ok) {
      const data = (await res.json()) as { templates: Template[] };
      // Merge default templates if DB is empty
      if (data.templates.length === 0) {
        const fakeDefaults: Template[] = DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `default-${i}`, createdAt: new Date().toISOString() }));
        setTemplates(fakeDefaults);
      } else {
        setTemplates(data.templates);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchTemplates(); }, [fetchTemplates]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    if (res.ok) { setCreating(false); setNewTemplate({ name: "", niche: "", subject: "", body: "" }); void fetchTemplates(); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/templates?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    void fetchTemplates();
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposal Templates</h1>
          <p className="text-muted-foreground mt-1">Reusable templates to speed up your outreach.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all shadow-glow-primary">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-48 bg-gradient-card border border-border rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-gradient-card border border-border hover:border-primary/30 rounded-2xl p-5 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-primary-light flex-shrink-0" />
                  <span className="text-foreground font-semibold text-sm">{t.name}</span>
                </div>
                {t.isDefault && <Badge variant="accent">Built-in</Badge>}
              </div>
              <p className="text-muted-foreground text-xs mb-1">Subject: <span className="text-foreground">{t.subject}</span></p>
              {t.niche && <p className="text-xs text-muted-foreground mb-3">Niche: {NICHES.find(n => n.id === t.niche)?.label ?? t.niche}</p>}
              <p className="text-muted-foreground text-xs line-clamp-2 mb-4">{t.body}</p>
              <div className="flex gap-2">
                <button onClick={() => setPreview(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Eye className="w-3 h-3" /> Preview
                </button>
                {!t.isDefault && (
                  <button onClick={() => setDeleteId(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-xl w-full shadow-card-hover" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">{preview.name}</h3>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Subject:</p>
            <p className="text-foreground font-medium mb-4 p-3 bg-background rounded-lg text-sm">{preview.subject}</p>
            <p className="text-xs text-muted-foreground mb-1">Body:</p>
            <pre className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans p-3 bg-background rounded-lg max-h-60 overflow-y-auto">{preview.body}</pre>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-card-hover">
            <h3 className="text-foreground font-semibold mb-4">Create Template</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Template Name</label>
                  <input required value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="My Template" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Niche (optional)</label>
                  <select value={newTemplate.niche} onChange={e => setNewTemplate({...newTemplate, niche: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50">
                    <option value="">Any niche</option>
                    {NICHES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Subject Line</label>
                <input required value={newTemplate.subject} onChange={e => setNewTemplate({...newTemplate, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50" placeholder="Subject with {{company}} placeholder" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Body — use {`{{name}}, {{company}}, {{your_name}}`} as placeholders</label>
                <textarea required rows={6} value={newTemplate.body} onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium"><Sparkles className="w-3.5 h-3.5 inline mr-1" />Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title="Delete Template" message="This template will be permanently deleted." confirmLabel="Delete" onConfirm={() => void handleDelete()} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
