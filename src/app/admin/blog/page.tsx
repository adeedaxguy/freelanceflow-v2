"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";

interface BlogPost { id: string; title: string; slug: string; category: string; published: boolean; readTime: number; createdAt: string; }
interface ApiResp { posts: BlogPost[]; }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: "", title: "", content: "", excerpt: "", category: "General", published: false });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/blog?admin=true");
    if (res.ok) { const d = (await res.json()) as ApiResp; setPosts(d.posts); }
    setLoading(false);
  }, []);

  useEffect(() => { void fetchPosts(); }, [fetchPosts]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setCreating(false); setEditing(null); setForm({ id: "", title: "", content: "", excerpt: "", category: "General", published: false });
    void fetchPosts();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/blog?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null); void fetchPosts();
  }

  async function togglePublish(post: BlogPost) {
    await fetch("/api/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, title: post.title, content: ".", published: !post.published }) });
    void fetchPosts();
  }

  const showForm = creating || !!editing;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog CMS</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog posts.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all shadow-glow-primary">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gradient-card border border-border rounded-xl animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="bg-gradient-card border border-border rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-foreground font-medium">No blog posts yet</p>
          <p className="text-muted-foreground text-sm">Create your first post to get started.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-background/50">
              {["Title", "Category", "Status", "Read Time", "Created", "Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border/50 last:border-0 hover:bg-primary/5">
                  <td className="px-5 py-3 text-foreground text-sm font-medium max-w-xs truncate">{post.title}</td>
                  <td className="px-5 py-3 text-muted-foreground text-sm">{post.category}</td>
                  <td className="px-5 py-3"><Badge variant={post.published ? "accent" : "outline"}>{post.published ? "Published" : "Draft"}</Badge></td>
                  <td className="px-5 py-3 text-muted-foreground text-sm">{post.readTime} min</td>
                  <td className="px-5 py-3 text-muted-foreground text-sm whitespace-nowrap">{formatDate(post.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(post); setForm({ id: post.id, title: post.title, content: "", excerpt: "", category: post.category, published: post.published }); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary-light hover:bg-primary/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => void togglePublish(post)} className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
                        {post.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setDeleteId(post.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full shadow-card-hover max-h-[90vh] overflow-y-auto">
            <h3 className="text-foreground font-semibold mb-4">{creating ? "New Post" : "Edit Post"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-xs text-muted-foreground mb-1">Title</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-muted-foreground mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50">
                    {["General","Strategy","Templates","Growth","Tools"].map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-primary" />
                    <span className="text-foreground text-sm">Publish immediately</span>
                  </label>
                </div>
              </div>
              <div><label className="block text-xs text-muted-foreground mb-1">Excerpt</label>
                <input value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50" placeholder="Short description..." /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Content (Markdown)</label>
                <textarea required rows={10} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none font-mono" /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Save Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteId} title="Delete Post" message="This blog post will be permanently deleted." onConfirm={() => void handleDelete()} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
