"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  EyeOff,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminBlogComment {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  approved: boolean;
  ip: string | null;
  createdAt: string;
  _count?: { replies: number };
}

interface CommentsResponse {
  comments: AdminBlogComment[];
  total: number;
  page: number;
  totalPages: number;
  counts: { pending: number; approved: number; all: number };
}

const FILTERS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All" },
] as const;

function StatusPill({ approved }: { approved: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
      approved
        ? "border-accent/25 bg-accent/10 text-accent"
        : "border-yellow-500/25 bg-yellow-500/10 text-yellow-300"
    }`}>
      {approved ? <ShieldCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminBlogComment[]>([]);
  const [counts, setCounts] = useState<CommentsResponse["counts"]>({ pending: 0, approved: 0, all: 0 });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: filter, page: String(page), limit: "20" });
    if (query.trim()) params.set("q", query.trim());

    const res = await fetch(`/api/admin/blog-comments?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as CommentsResponse;
      setComments(data.comments);
      setCounts(data.counts);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [filter, page, query]);

  useEffect(() => { void load(); }, [load]);

  async function setApproved(id: string, approved: boolean) {
    setBusyId(id);
    const res = await fetch("/api/admin/blog-comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    if (res.ok) await load();
    setBusyId(null);
  }

  async function deleteComment(id: string) {
    if (!window.confirm("Delete this comment permanently?")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/blog-comments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) await load();
    setBusyId(null);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    void load();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-foreground">
            <MessageCircle className="h-6 w-6 text-primary-light" />
            Blog Comments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review reader comments before they appear publicly on blog posts.
          </p>
        </div>

        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-yellow-300/80">Pending</p>
          <p className="mt-2 text-2xl font-bold text-yellow-300">{counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-accent/80">Approved</p>
          <p className="mt-2 text-2xl font-bold text-accent">{counts.approved}</p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{counts.all}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setFilter(item.id); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === item.id
                  ? "bg-primary text-white"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search comments..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
          />
        </form>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-gradient-card" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-border bg-gradient-card p-12 text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
          <p className="font-semibold text-foreground">No comments found</p>
          <p className="mt-1 text-sm text-muted-foreground">New pending comments will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-border bg-gradient-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill approved={comment.approved} />
                    {comment.parentId && (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-light">
                        Reply
                      </span>
                    )}
                    {comment._count?.replies ? (
                      <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                        {comment._count.replies} replies
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-base font-bold text-foreground">{comment.authorName}</h2>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {comment.authorEmail} · {formatDate(comment.createdAt)}
                    {comment.ip ? ` · IP ${comment.ip}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/blog/${comment.postSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View post <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  {comment.approved ? (
                    <button
                      onClick={() => void setApproved(comment.id, false)}
                      disabled={busyId === comment.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </button>
                  ) : (
                    <button
                      onClick={() => void setApproved(comment.id, true)}
                      disabled={busyId === comment.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/15 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => void deleteComment(comment.id)}
                    disabled={busyId === comment.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line rounded-xl border border-border bg-background/60 p-4 text-sm leading-relaxed text-muted-foreground">
                {comment.content}
              </p>
              <p className="mt-3 truncate text-xs text-muted-foreground/70">
                Post: <span className="text-foreground">{comment.postSlug}</span>
              </p>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-gradient-card p-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
