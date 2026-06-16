"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Reply, Send, ChevronDown, ChevronUp } from "lucide-react";

interface CommentData {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: CommentData[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

interface CommentFormProps {
  slug: string;
  parentId?: string;
  onSuccess: (comment: CommentData) => void;
  onCancel?: () => void;
  compact?: boolean;
}

function CommentForm({ slug, parentId, onSuccess, onCancel, compact }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState(""); // spam trap
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compact && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [compact]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, parentId, authorName: name, authorEmail: email, content, honeypot }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to post comment");
      } else {
        onSuccess(data.comment);
        setName("");
        setEmail("");
        setContent("");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={formRef}>
      <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? "pt-3" : ""}`}>
        {/* Honeypot — hidden from humans, bots fill it */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
          autoComplete="off"
        />

        {!compact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
            <input
              type="email"
              placeholder="Email (not published) *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
        )}

        {compact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        )}

        <textarea
          placeholder={compact ? "Write a reply…" : "Share your thoughts, questions, or experience…"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          required
          rows={compact ? 2 : 4}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
        />

        {error && (
          <p className="text-red-400 text-xs px-1">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Posting…" : compact ? "Reply" : "Post Comment"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Cancel
            </button>
          )}
          {!compact && (
            <span className="text-xs text-muted-foreground/60 ml-auto">
              {content.length}/2000
            </span>
          )}
        </div>

        {!compact && (
          <p className="text-xs text-muted-foreground/50">
            Your email is never published. Comments are reviewed for spam automatically.
          </p>
        )}
      </form>
    </div>
  );
}

interface ReplyProps {
  reply: CommentData;
}

function ReplyItem({ reply }: ReplyProps) {
  return (
    <div className="flex gap-3 pt-3">
      <div className="w-px bg-border mx-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <Avatar name={reply.authorName} />
          <div>
            <span className="text-foreground text-sm font-semibold">{reply.authorName}</span>
            <span className="text-muted-foreground/50 text-xs ml-2">{timeAgo(reply.createdAt)}</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mt-2 ml-10">{reply.content}</p>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentData;
  slug: string;
  onReplyAdded: (commentId: string, reply: CommentData) => void;
}

function CommentItem({ comment, slug, onReplyAdded }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const replies = comment.replies ?? [];
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);

  return (
    <div className="p-5 bg-white/[0.03] border border-border rounded-2xl">
      <div className="flex items-start gap-3">
        <Avatar name={comment.authorName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-foreground font-semibold text-sm">{comment.authorName}</span>
            <span className="text-muted-foreground/50 text-xs">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mt-2">{comment.content}</p>

          <button
            onClick={() => setShowReplyForm((v) => !v)}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/70 hover:text-primary-light transition-colors"
          >
            <Reply className="w-3.5 h-3.5" />
            {showReplyForm ? "Cancel" : "Reply"}
          </button>

          {showReplyForm && (
            <div className="mt-3 pl-1 border-l-2 border-primary/20">
              <CommentForm
                slug={slug}
                parentId={comment.id}
                compact
                onSuccess={(reply) => {
                  onReplyAdded(comment.id, reply);
                  setShowReplyForm(false);
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 space-y-1 divide-y divide-border/40">
              {visibleReplies.map((r) => <ReplyItem key={r.id} reply={r} />)}
              {replies.length > 2 && (
                <button
                  onClick={() => setShowAllReplies((v) => !v)}
                  className="flex items-center gap-1 pt-2 text-xs text-muted-foreground/60 hover:text-primary-light transition-colors"
                >
                  {showAllReplies
                    ? <><ChevronUp className="w-3.5 h-3.5" /> Hide replies</>
                    : <><ChevronDown className="w-3.5 h-3.5" /> Show {replies.length - 2} more {replies.length - 2 === 1 ? "reply" : "replies"}</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BlogCommentsProps {
  slug: string;
  initialComments?: CommentData[];
}

export default function BlogComments({ slug, initialComments = [] }: BlogCommentsProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [loading, setLoading] = useState(initialComments.length === 0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (initialComments.length === 0) {
      fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((d) => setComments(d.comments ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug, initialComments.length]);

  function handleNewComment(comment: CommentData) {
    setComments((prev) => [{ ...comment, replies: [] }, ...prev]);
    setShowForm(false);
  }

  function handleReplyAdded(commentId: string, reply: CommentData) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies ?? []), reply] }
          : c
      )
    );
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-light" />
          {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary-light hover:bg-primary/20 text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Leave a comment
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 p-5 bg-white/[0.03] border border-primary/20 rounded-2xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Add a comment</h3>
          <CommentForm
            slug={slug}
            onSuccess={handleNewComment}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 bg-white/[0.03] border border-border rounded-2xl animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-32" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/60">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-primary-light hover:underline"
            >
              Write a comment →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              slug={slug}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </section>
  );
}
