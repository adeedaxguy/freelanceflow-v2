"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, ArrowLeft,
  Save, Globe, Tag, User, Image, Search, CheckCircle,
  AlertCircle, XCircle, RefreshCw, ExternalLink, Bold,
  Italic, List, Heading1, Heading2, Code, Quote, Link2,
  AlignLeft, Type, Minus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; category: string;
  published: boolean; readTime: number; author: string; focusKeyword: string;
  metaTitle: string; metaDesc: string; tags: string; createdAt: string;
}

interface PostForm {
  id: string; title: string; content: string; excerpt: string; category: string;
  published: boolean; coverImage: string; author: string; tags: string; readTime?: number;
  metaTitle: string; metaDesc: string; focusKeyword: string; ogImage: string;
  canonical: string; noIndex: boolean; twitterCard: string; schema: string;
}

const EMPTY_FORM: PostForm = {
  id:"", title:"", content:"", excerpt:"", category:"General",
  published:false, coverImage:"", author:"iCloseLeads Team", tags:"",
  metaTitle:"", metaDesc:"", focusKeyword:"", ogImage:"", canonical:"",
  noIndex:false, twitterCard:"summary_large_image", schema:"",
};

const CATEGORIES = ["General","Strategy","Templates","Growth","Tools","Case Study","News"];

// ─── SEO Scoring Engine ───────────────────────────────────────────────────────
interface SeoCheck { id: string; label: string; status: "good"|"ok"|"bad"; tip: string; }

function computeSeoScore(form: PostForm): { score: number; checks: SeoCheck[] } {
  const kw       = form.focusKeyword.toLowerCase().trim();
  const title    = form.title.toLowerCase();
  const metaT    = (form.metaTitle || form.title).toLowerCase();
  const metaD    = form.metaDesc.toLowerCase();
  const content  = form.content.replace(/<[^>]*>/g,"").toLowerCase();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const kwCount  = kw ? (content.match(new RegExp(kw,"g"))?.length ?? 0) : 0;
  const kwDensity = wordCount > 0 ? (kwCount / wordCount) * 100 : 0;

  const checks: SeoCheck[] = [
    {
      id:"kw_title",
      label:"Focus keyword in SEO title",
      status: !kw ? "bad" : metaT.includes(kw) ? "good" : "bad",
      tip: !kw ? "Set a focus keyword first." : metaT.includes(kw) ? "Great!" : "Add your focus keyword to the SEO title.",
    },
    {
      id:"kw_desc",
      label:"Focus keyword in meta description",
      status: !kw ? "bad" : metaD.includes(kw) ? "good" : "bad",
      tip: !kw ? "Set a focus keyword first." : metaD.includes(kw) ? "Great!" : "Include the focus keyword in your meta description.",
    },
    {
      id:"kw_intro",
      label:"Focus keyword in first paragraph",
      status: !kw ? "bad" : content.slice(0,300).includes(kw) ? "good" : "ok",
      tip: !kw ? "Set a focus keyword." : content.slice(0,300).includes(kw) ? "Great!" : "Try to use the keyword in the first 100 words.",
    },
    {
      id:"kw_density",
      label:`Keyword density (${kwDensity.toFixed(1)}%)`,
      status: !kw ? "bad" : kwDensity >= 0.5 && kwDensity <= 2.5 ? "good" : kwDensity > 0 ? "ok" : "bad",
      tip: !kw ? "Set a focus keyword." : kwDensity >= 0.5 && kwDensity <= 2.5 ? "Optimal density!" : kwDensity > 2.5 ? "Keyword is over-used (>2.5%). Reduce it." : "Use the keyword more throughout the content.",
    },
    {
      id:"meta_title_len",
      label:`SEO title length (${(form.metaTitle||form.title).length} chars)`,
      status: (form.metaTitle||form.title).length >= 50 && (form.metaTitle||form.title).length <= 60 ? "good" :
              (form.metaTitle||form.title).length > 0 ? "ok" : "bad",
      tip: (form.metaTitle||form.title).length >= 50 && (form.metaTitle||form.title).length <= 60 ? "Perfect length!" : "Aim for 50–60 characters for the SEO title.",
    },
    {
      id:"meta_desc_len",
      label:`Meta description length (${form.metaDesc.length} chars)`,
      status: form.metaDesc.length >= 120 && form.metaDesc.length <= 160 ? "good" :
              form.metaDesc.length > 0 ? "ok" : "bad",
      tip: form.metaDesc.length >= 120 && form.metaDesc.length <= 160 ? "Perfect length!" : "Aim for 120–160 characters.",
    },
    {
      id:"word_count",
      label:`Content length (${wordCount} words)`,
      status: wordCount >= 600 ? "good" : wordCount >= 300 ? "ok" : "bad",
      tip: wordCount >= 600 ? "Great length for SEO!" : wordCount >= 300 ? "Consider writing 600+ words for better rankings." : "Content too short — aim for at least 300 words.",
    },
    {
      id:"has_excerpt",
      label:"Has excerpt / description",
      status: form.excerpt.length >= 50 ? "good" : form.excerpt.length > 0 ? "ok" : "bad",
      tip: form.excerpt.length >= 50 ? "Good!" : "Write a compelling excerpt (50–155 chars).",
    },
    {
      id:"has_cover",
      label:"Has cover/OG image",
      status: form.ogImage || form.coverImage ? "good" : "bad",
      tip: form.ogImage || form.coverImage ? "Image set!" : "Add an OG or cover image for social sharing.",
    },
    {
      id:"has_tags",
      label:"Has tags",
      status: form.tags.trim().length > 0 ? "good" : "bad",
      tip: form.tags.trim().length > 0 ? "Good!" : "Add comma-separated tags to improve discoverability.",
    },
  ];

  const good = checks.filter(c => c.status === "good").length;
  const score = Math.round((good / checks.length) * 100);
  return { score, checks };
}

// ─── Rich Text Toolbar ────────────────────────────────────────────────────────
function RichToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? "");
  }
  function insertBlock(tag: string) {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
  }
  function insertLink() {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  }
  function insertHr() {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, "<hr/><p><br/></p>");
  }

  const tools = [
    { icon: Bold,     label:"Bold",         fn: () => exec("bold")                  },
    { icon: Italic,   label:"Italic",       fn: () => exec("italic")                },
    { type:"sep" },
    { icon: Heading1, label:"H2",           fn: () => insertBlock("h2")             },
    { icon: Heading2, label:"H3",           fn: () => insertBlock("h3")             },
    { icon: Type,     label:"Paragraph",    fn: () => insertBlock("p")              },
    { type:"sep" },
    { icon: List,     label:"Bullet List",  fn: () => exec("insertUnorderedList")   },
    { icon: AlignLeft,label:"Numbered List",fn: () => exec("insertOrderedList")     },
    { type:"sep" },
    { icon: Quote,    label:"Blockquote",   fn: () => insertBlock("blockquote")     },
    { icon: Code,     label:"Code",         fn: () => exec("formatBlock","pre")     },
    { icon: Link2,    label:"Link",         fn: insertLink                           },
    { icon: Minus,    label:"Divider",      fn: insertHr                             },
  ] as const;

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 bg-background border-b border-border">
      {tools.map((t, i) => {
        if ("type" in t && t.type === "sep") return <div key={i} className="w-px h-5 bg-border mx-1" />;
        const Icon = (t as { icon: React.ElementType; label: string; fn: () => void }).icon;
        return (
          <button key={i} type="button"
            onMouseDown={e => { e.preventDefault(); (t as { fn: () => void }).fn(); }}
            title={(t as { label: string }).label}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all">
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

// ─── SEO Score Badge ──────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-400 bg-green-500/10 border-green-500/20"
              : score >= 40 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
              : "text-red-400 bg-red-500/10 border-red-500/20";
  const label = score >= 70 ? "Good" : score >= 40 ? "OK" : "Poor";
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${color}`}>
      {score}/100 · {label}
    </span>
  );
}

// ─── Google Preview ───────────────────────────────────────────────────────────
function GooglePreview({ form }: { form: PostForm }) {
  const seoTitle = form.metaTitle || form.title || "Article Title";
  const seoDesc  = form.metaDesc  || form.excerpt || "Meta description will appear here.";
  const slug     = form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") : "article-slug";
  const url      = `icloseleads.com › blog › ${slug}`;
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 font-sans">
      <p className="text-xs text-green-700 mb-0.5">{url}</p>
      <p className="text-lg text-blue-800 hover:underline cursor-pointer leading-tight mb-1 line-clamp-1">{seoTitle}</p>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{seoDesc}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminBlogPage() {
  const [posts,    setPosts]   = useState<BlogPost[]>([]);
  const [loading,  setLoading] = useState(true);
  const [editing,  setEditing] = useState(false);
  const [form,     setForm]    = useState<PostForm>(EMPTY_FORM);
  const [saving,   setSaving]  = useState(false);
  const [saved,    setSaved]   = useState(false);
  const [deleteId, setDeleteId]= useState<string|null>(null);
  const [tab,      setTab]     = useState<"write"|"seo"|"preview">("write");
  const editorRef = useRef<HTMLDivElement>(null);
  const { score, checks } = computeSeoScore(form);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/blog?admin=true");
    if (r.ok) { const d = await r.json() as { posts: BlogPost[] }; setPosts(d.posts); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openNew() {
    setForm(EMPTY_FORM);
    setTab("write");
    setEditing(true);
  }

  async function openEdit(post: BlogPost) {
    const r = await fetch(`/api/blog?id=${post.id}`);
    if (!r.ok) return;
    const d = await r.json() as { post: Record<string, unknown> };
    const p = d.post;
    setForm({
      id:          String(p.id ?? ""),
      title:       String(p.title ?? ""),
      content:     String(p.content ?? ""),
      excerpt:     String(p.excerpt ?? ""),
      category:    String(p.category ?? "General"),
      published:   Boolean(p.published),
      coverImage:  String(p.coverImage ?? ""),
      author:      String(p.author ?? "iCloseLeads Team"),
      tags:        String(p.tags ?? ""),
      metaTitle:   String(p.metaTitle ?? ""),
      metaDesc:    String(p.metaDesc ?? ""),
      focusKeyword:String(p.focusKeyword ?? ""),
      ogImage:     String(p.ogImage ?? ""),
      canonical:   String(p.canonical ?? ""),
      noIndex:     Boolean(p.noIndex),
      twitterCard: String(p.twitterCard ?? "summary_large_image"),
      schema:      String(p.schema ?? ""),
    });
    setTab("write");
    setEditing(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = String(p.content ?? "");
    }, 100);
  }

  function syncContent() {
    if (editorRef.current) {
      setForm(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  }

  async function save(publish?: boolean) {
    syncContent();
    setSaving(true);
    const payload = { ...form, content: editorRef.current?.innerHTML ?? form.content };
    if (publish !== undefined) payload.published = publish;
    const r = await fetch("/api/blog", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload),
    });
    if (r.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      await load();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/blog?id=${id}`, { method:"DELETE" });
    setDeleteId(null);
    await load();
  }

  async function togglePublish(post: BlogPost) {
    await fetch("/api/blog", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id: post.id, title: post.title, content: ".", published: !post.published }),
    });
    await load();
  }

  // ── Editor view ─────────────────────────────────────────────────────────────
  if (editing) return (
    <div className="flex flex-col h-full min-h-screen bg-background">

      {/* Editor top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(false)} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-sm font-semibold text-foreground">{form.id ? "Edit Post" : "New Post"}</p>
            <p className="text-xs text-muted-foreground">{form.published ? "Published" : "Draft"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={score} />
          <button onClick={() => void save()} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin"/> : <Save className="w-3.5 h-3.5"/>}
            {saved ? "Saved!" : "Save Draft"}
          </button>
          <button onClick={() => void save(!form.published)} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              form.published ? "bg-muted text-muted-foreground border border-border hover:text-foreground"
                            : "bg-primary text-white hover:bg-primary-light"
            }`}>
            {form.published ? <><EyeOff className="w-3.5 h-3.5"/> Unpublish</> : <><Globe className="w-3.5 h-3.5"/> Publish</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-border bg-surface">
        {(["write","seo","preview"] as const).map(t => (
          <button key={t} onClick={() => { syncContent(); setTab(t); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-all ${
              tab === t ? "bg-background text-foreground border border-border border-b-background -mb-px" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "seo" ? `SEO ${score >= 70 ? "✅" : score >= 40 ? "⚠️" : "❌"}` : t === "preview" ? "Preview" : "Write"}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ── Write Tab ──────────────────────────────────────────────────────── */}
        {tab === "write" && (
          <div className="flex flex-1 min-w-0 overflow-hidden">
            {/* Main editor */}
            <div className="flex-1 flex flex-col min-w-0 overflow-auto p-6 space-y-5">
              <input
                value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))}
                placeholder="Article Title…"
                className="w-full text-3xl font-bold bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none border-0"
              />
              <textarea
                value={form.excerpt} onChange={e => setForm(p => ({...p, excerpt:e.target.value}))}
                placeholder="Short excerpt / introduction (shown on blog listing)…"
                rows={2}
                className="w-full bg-transparent text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none border-0 resize-none text-base"
              />
              <div className="border border-border rounded-xl overflow-hidden">
                <RichToolbar editorRef={editorRef} />
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncContent}
                  dangerouslySetInnerHTML={{ __html: form.content || "<p><br/></p>" }}
                  className="min-h-[420px] p-6 text-foreground focus:outline-none prose-editor"
                  style={{ lineHeight:"1.8", fontSize:"15px" }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-5 space-y-5 bg-surface">
              {/* Publish */}
              <div className="bg-gradient-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Publish</h3>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">Published</span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${form.published ? "bg-accent" : "bg-muted"}`}
                    onClick={() => setForm(p => ({...p, published:!p.published}))}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.published ? "left-5" : "left-0.5"}`} />
                  </div>
                </label>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Details */}
              <div className="bg-gradient-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Post Details</h3>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><User className="w-3 h-3"/>Author</label>
                  <input value={form.author} onChange={e => setForm(p => ({...p, author:e.target.value}))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Tag className="w-3 h-3"/>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(p => ({...p, tags:e.target.value}))}
                    placeholder="freelance, cold email, leads…"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Image className="w-3 h-3"/>Cover Image URL</label>
                  <input value={form.coverImage} onChange={e => setForm(p => ({...p, coverImage:e.target.value}))}
                    placeholder="https://…"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"/>
                </div>
              </div>

              {/* Quick SEO */}
              <div className="bg-gradient-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SEO Quick</h3>
                  <ScoreBadge score={score} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Search className="w-3 h-3"/>Focus Keyword</label>
                  <input value={form.focusKeyword} onChange={e => setForm(p => ({...p, focusKeyword:e.target.value}))}
                    placeholder="e.g. freelance leads"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"/>
                </div>
                {/* Mini checks */}
                <div className="space-y-1">
                  {checks.slice(0,4).map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-xs">
                      {c.status === "good"
                        ? <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0"/>
                        : c.status === "ok"
                        ? <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0"/>
                        : <XCircle className="w-3 h-3 text-red-400 flex-shrink-0"/>
                      }
                      <span className="text-muted-foreground truncate">{c.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { syncContent(); setTab("seo"); }}
                  className="w-full text-xs py-1.5 rounded-lg border border-primary/30 text-primary-light hover:bg-primary/10 transition-all">
                  Full SEO Analysis →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SEO Tab ────────────────────────────────────────────────────────── */}
        {tab === "seo" && (
          <div className="flex-1 overflow-auto p-6 space-y-6 max-w-4xl">

            {/* Score banner */}
            <div className={`flex items-center justify-between p-5 rounded-2xl border ${
              score >= 70 ? "bg-green-500/10 border-green-500/20" :
              score >= 40 ? "bg-yellow-500/10 border-yellow-500/20" :
              "bg-red-500/10 border-red-500/20"
            }`}>
              <div>
                <p className="text-lg font-bold text-foreground">SEO Score: {score}/100</p>
                <p className="text-sm text-muted-foreground">
                  {score >= 70 ? "Good — ready to publish!" : score >= 40 ? "Needs some improvement before publishing." : "Poor — fix the issues below."}
                </p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30"/>
                  <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                    strokeDasharray={`${(score/100)*94} 94`}
                    className={score>=70?"stroke-green-400":score>=40?"stroke-yellow-400":"stroke-red-400"}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{score}</div>
              </div>
            </div>

            {/* SEO Fields */}
            <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-foreground font-semibold">Search Appearance</h2>
              <GooglePreview form={form} />
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Focus Keyword
                    <span className="ml-2 text-xs text-muted-foreground font-normal">The main keyword this article should rank for</span>
                  </label>
                  <input value={form.focusKeyword} onChange={e => setForm(p => ({...p, focusKeyword:e.target.value}))}
                    placeholder="e.g. how to find freelance clients"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center justify-between">
                    <span>SEO Title</span>
                    <span className={`text-xs ${(form.metaTitle||form.title).length<=60?"text-green-400":"text-red-400"}`}>
                      {(form.metaTitle||form.title).length}/60
                    </span>
                  </label>
                  <input value={form.metaTitle} onChange={e => setForm(p => ({...p, metaTitle:e.target.value}))}
                    placeholder={form.title || "SEO title (leave blank to use post title)"}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center justify-between">
                    <span>Meta Description</span>
                    <span className={`text-xs ${form.metaDesc.length>=120&&form.metaDesc.length<=160?"text-green-400":form.metaDesc.length>0?"text-yellow-400":"text-muted-foreground"}`}>
                      {form.metaDesc.length}/160
                    </span>
                  </label>
                  <textarea value={form.metaDesc} onChange={e => setForm(p => ({...p, metaDesc:e.target.value}))}
                    rows={3} maxLength={165}
                    placeholder="Write a compelling meta description (120–160 characters) to improve click-through rates…"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"/>
                </div>
              </div>
            </div>

            {/* SEO Checks */}
            <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-foreground font-semibold">SEO Analysis</h2>
              <div className="space-y-2">
                {checks.map(c => (
                  <div key={c.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    c.status==="good" ? "bg-green-500/5 border-green-500/15"
                    : c.status==="ok" ? "bg-yellow-500/5 border-yellow-500/15"
                    : "bg-red-500/5 border-red-500/15"
                  }`}>
                    {c.status==="good" ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5"/>
                      : c.status==="ok" ? <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5"/>
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"/>
                    }
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced SEO */}
            <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-foreground font-semibold">Advanced Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">OG / Social Image URL</label>
                  <input value={form.ogImage} onChange={e => setForm(p => ({...p, ogImage:e.target.value}))}
                    placeholder="https://… (1200×630px)"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Canonical URL</label>
                  <input value={form.canonical} onChange={e => setForm(p => ({...p, canonical:e.target.value}))}
                    placeholder="Leave blank for default"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Twitter Card Type</label>
                  <select value={form.twitterCard} onChange={e => setForm(p => ({...p, twitterCard:e.target.value}))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none">
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-10 h-5 rounded-full transition-colors relative ${form.noIndex?"bg-red-500":"bg-muted"}`}
                      onClick={() => setForm(p => ({...p, noIndex:!p.noIndex}))}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.noIndex?"left-5":"left-0.5"}`}/>
                    </div>
                    <span className="text-sm text-foreground">No-index (hide from search engines)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Custom JSON-LD Schema <span className="text-xs text-muted-foreground font-normal">(advanced — paste Article/FAQPage schema)</span>
                </label>
                <textarea value={form.schema} onChange={e => setForm(p => ({...p, schema:e.target.value}))}
                  rows={5}
                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Your Title"\n}`}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none font-mono resize-none"/>
              </div>
            </div>
          </div>
        )}

        {/* ── Preview Tab ────────────────────────────────────────────────────── */}
        {tab === "preview" && (
          <div className="flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto px-6 py-12">
              {form.coverImage && (
                <img src={form.coverImage} alt={form.title} className="w-full h-64 object-cover rounded-2xl mb-8"/>
              )}
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <span className="px-2.5 py-1 bg-primary/10 text-primary-light rounded-full text-xs font-medium">{form.category}</span>
                <span>·</span>
                <span>{form.author}</span>
                <span>·</span>
                <span>{form.readTime || Math.max(1, Math.ceil(form.content.replace(/<[^>]*>/g,"").split(/\s+/).length / 200))} min read</span>
              </div>
              <h1 className="text-4xl font-extrabold text-foreground mb-4">{form.title || "Article Title"}</h1>
              {form.excerpt && <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{form.excerpt}</p>}
              <div className="prose text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: form.content }} />
              {form.tags && (
                <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
                  {form.tags.split(",").map(t => (
                    <span key={t.trim()} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">#{t.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Post List ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground mt-1 text-sm">{posts.length} posts · Full SEO editor</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-light transition-all shadow-glow-primary">
          <Plus className="w-4 h-4"/> New Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-7 h-7 animate-spin text-muted-foreground"/>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          <BookOpen className="w-12 h-12 mb-3 opacity-20"/>
          <p className="text-sm font-medium">No posts yet</p>
          <button onClick={openNew} className="mt-4 text-xs text-primary-light hover:underline">Create your first post →</button>
        </div>
      ) : (
        <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 border-b border-border bg-muted/10">
            <span className="col-span-5">Title</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">SEO Keyword</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          <div className="divide-y divide-border/40">
            {posts.map(post => (
              <div key={post.id} className="grid grid-cols-12 items-center px-5 py-4 hover:bg-primary/5 transition-colors">
                <div className="col-span-5 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{post.readTime} min · {new Date(post.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</p>
                </div>
                <span className="col-span-2 text-xs text-muted-foreground">{post.category}</span>
                <span className="col-span-2 text-xs text-muted-foreground truncate">{post.focusKeyword || "—"}</span>
                <span className="col-span-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    post.published ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-muted-foreground bg-muted border-border"
                  }`}>
                    {post.published ? "Live" : "Draft"}
                  </span>
                </span>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  {post.published && (
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all" title="View live">
                      <ExternalLink className="w-3.5 h-3.5"/>
                    </a>
                  )}
                  <button onClick={() => void togglePublish(post)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-all" title={post.published?"Unpublish":"Publish"}>
                    {post.published ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                  </button>
                  <button onClick={() => void openEdit(post)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary-light transition-all" title="Edit">
                    <Edit2 className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => setDeleteId(post.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-all" title="Delete">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-foreground font-semibold mb-2">Delete Post?</h3>
            <p className="text-sm text-muted-foreground mb-6">This cannot be undone. The post will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => void handleDelete(deleteId)} className="flex-1 py-2 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
