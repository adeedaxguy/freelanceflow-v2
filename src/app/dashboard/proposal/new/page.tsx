"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles, Eye, EyeOff, Loader2, CheckCircle,
  ArrowLeft, ExternalLink, Mail, Building2, Briefcase,
  RefreshCw, Link as LinkIcon, Plus, Trash2, Globe,
  Copy, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { copyText } from "@/lib/clipboard";

interface ProposalResult { subject: string; body: string; source: string; }
interface PortfolioLink { label: string; url: string; }
interface OutreachUsage {
  daily: number;
  monthly: number;
  perMinute: number;
  label: string;
  usedToday: number;
  usedThisMonth: number;
  remainingToday: number;
  remainingThisMonth: number;
  nextDailyReset: string;
}
interface PrepareResponse {
  success?: boolean;
  composeUrl?: string;
  mailtoUrl?: string;
  usage?: OutreachUsage;
  error?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"').replace(/&#\d+;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\b(?:src|href|alt|class|id|width|height|style|rel|type)\s*=\s*["'][^"']*["']/gi, " ")
    .replace(/\s+/g, " ").trim();
}

function CopyButton({ text, label = "Copy Proposal" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { void copyText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); }); }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 text-xs font-medium transition-all"
    >
      {ok ? <><CheckCircle className="w-3.5 h-3.5 text-accent" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> {label}</>}
    </button>
  );
}

function NewProposalInner() {
  const params = useSearchParams();
  const company     = params.get("company") ?? "";
  const domain      = params.get("domain") ?? "";
  const jobTitle    = params.get("title") ?? "";
  const description = params.get("description") ?? "";
  const jobUrl      = params.get("url") ?? "";
  const niche       = params.get("niche") ?? "";
  const emailParam  = params.get("email") ?? "";
  const leadType    = params.get("leadType") ?? "";

  const hasEmail = emailParam.length > 0;
  const isLocalBusinessLead = leadType === "local-business";
  const sourcePageLabel = isLocalBusinessLead ? "Business Profile" : "Source Page";

  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("");
  const [preview,    setPreview]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preparing,  setPreparing]  = useState(false);
  const [prepared,   setPrepared]   = useState(false);
  const [toEmail,    setToEmail]    = useState(emailParam);
  const [aiSource,   setAiSource]   = useState<string | null>(null);
  const [error,      setError]      = useState("");
  const [usage,      setUsage]      = useState<OutreachUsage | null>(null);
  const [composeUrl, setComposeUrl] = useState("");

  // Portfolio links
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([]);
  const [newLink,        setNewLink]        = useState<PortfolioLink>({ label: "", url: "" });
  const [linksLoaded,    setLinksLoaded]    = useState(false);

  // Load saved portfolio links from profile
  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then((d: { user?: { portfolioLinks?: string } }) => {
        if (d.user?.portfolioLinks) {
          try {
            const links = typeof d.user.portfolioLinks === "string"
              ? (JSON.parse(d.user.portfolioLinks) as PortfolioLink[])
              : (d.user.portfolioLinks as PortfolioLink[]);
            if (Array.isArray(links)) setPortfolioLinks(links);
          } catch { /* ignore */ }
        }
        setLinksLoaded(true);
      })
      .catch(() => setLinksLoaded(true));
  }, []);

  useEffect(() => {
    fetch("/api/email/usage")
      .then(r => r.ok ? r.json() as Promise<{ usage?: OutreachUsage }> : null)
      .then(d => { if (d?.usage) setUsage(d.usage); })
      .catch(() => null);
  }, []);

  const generate = useCallback(async (links?: PortfolioLink[]) => {
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle:       jobTitle || "Freelance Project",
          company:        company || "this company",
          description:    stripHtml(description),
          niche,
          portfolioLinks: links ?? portfolioLinks,
        }),
      });
      const data = await res.json() as ProposalResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setSubject(data.subject);
      setBody(data.body);
      setAiSource(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [jobTitle, company, description, niche, portfolioLinks]);

  // Auto-generate once profile links are loaded
  useEffect(() => {
    if (linksLoaded) void generate(portfolioLinks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linksLoaded]);

  function addLink() {
    if (!newLink.url) return;
    const raw = newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`;
    const label = newLink.label || (() => { try { return new URL(raw).hostname.replace(/^www\./, ""); } catch { return raw; } })();
    setPortfolioLinks(prev => [...prev, { label, url: raw }]);
    setNewLink({ label: "", url: "" });
  }

  function removeLink(i: number) {
    setPortfolioLinks(prev => prev.filter((_, idx) => idx !== i));
  }

  const handlePrepareInGmail = useCallback(async () => {
    if (!toEmail) { setError("Please enter the recipient's email address."); return; }
    if (!subject) { setError("Subject line is required."); return; }
    if (!body)    { setError("Proposal body is required."); return; }

    const composeWindow = window.open("about:blank", "_blank");
    setPreparing(true); setError(""); setComposeUrl("");
    try {
      const res = await fetch("/api/email/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toEmail, subject, body, company, domain }),
      });
      const data = await res.json() as PrepareResponse;
      if (!res.ok || !data.composeUrl) throw new Error(data.error ?? "Could not prepare Gmail compose");
      if (data.usage) setUsage(data.usage);
      setPrepared(true);
      setComposeUrl(data.composeUrl);
      if (composeWindow) {
        composeWindow.location.href = data.composeUrl;
      } else {
        window.open(data.composeUrl, "_blank");
      }
    } catch (e) {
      if (composeWindow) composeWindow.close();
      setError(e instanceof Error ? e.message : "Could not prepare Gmail compose.");
    } finally {
      setPreparing(false);
    }
  }, [toEmail, subject, body, company, domain]);

  const cleanDescription = stripHtml(description).slice(0, 400);
  const dailyPct = usage ? Math.min(100, Math.round((usage.usedToday / usage.daily) * 100)) : 0;
  const monthPct = usage ? Math.min(100, Math.round((usage.usedThisMonth / usage.monthly) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={isLocalBusinessLead ? "/dashboard/local-leads" : "/dashboard/leads"}
          className="mt-1 p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-extrabold text-foreground">AI Proposal</h1>
            {aiSource && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                aiSource === "groq"
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-primary/10 text-primary-light border-primary/20"
              }`}>
                {aiSource === "groq" ? "✦ AI Generated" : "✦ Template"}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {company && (
              <span className="flex items-center gap-1.5 text-primary-light font-semibold">
                <Building2 className="w-3.5 h-3.5" /> {company}
              </span>
            )}
            {domain && domain !== "reddit.com" && (
              <span className="text-muted-foreground">{domain}</span>
            )}
            {jobTitle && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" /> {jobTitle}
              </span>
            )}
            {jobUrl && (
              <a href={jobUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-light transition-colors">
                <ExternalLink className="w-3 h-3" /> View Job
              </a>
            )}
          </div>
        </div>
      </div>

      {/* No-email banner */}
      {!hasEmail && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 font-semibold text-sm mb-1">No email found for this lead</p>
              <p className="text-amber-400/80 text-xs leading-relaxed mb-3">
                We couldn't find a contact email for {company || "this company"}. Copy the proposal and use it on the source page, business profile, contact form, or phone outreach.
              </p>
              {jobUrl && (
                <a
                  href={jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-hero text-white font-bold text-sm shadow-glow-primary hover:opacity-90 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  Open {sourcePageLabel}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job brief */}
      {cleanDescription && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{isLocalBusinessLead ? "Lead Brief" : "Job Brief"}</p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{cleanDescription}</p>
        </div>
      )}

      {/* Portfolio Links */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary-light" /> Portfolio Links
            <span className="text-xs text-muted-foreground font-normal">(embedded in your proposal)</span>
          </h2>
        </div>

        {portfolioLinks.length > 0 && (
          <div className="space-y-1.5">
            {portfolioLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
                <LinkIcon className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
                <span className="text-xs font-medium text-foreground flex-shrink-0">{link.label}</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs text-accent truncate flex-1">{link.url}</span>
                <button type="button" onClick={() => removeLink(i)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newLink.label}
            onChange={e => setNewLink(prev => ({ ...prev, label: e.target.value }))}
            placeholder="Label (e.g. GitHub, Dribbble)"
            className="w-36 px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 flex-shrink-0"
          />
          <input
            type="url"
            value={newLink.url}
            onChange={e => setNewLink(prev => ({ ...prev, url: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addLink())}
            placeholder="https://..."
            className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <button type="button" onClick={addLink} disabled={!newLink.url}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/15 text-primary-light border border-primary/30 hover:bg-primary/25 text-xs font-medium transition-all disabled:opacity-40 flex-shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {portfolioLinks.length === 0 && (
          <p className="text-xs text-muted-foreground/50">
            No links yet. Add portfolio links to make your proposal stand out. You can save defaults in your <Link href="/dashboard/profile" className="underline hover:text-muted-foreground">Profile</Link>.
          </p>
        )}
      </div>

      {/* Generating */}
      {generating && (
        <div className="bg-surface border border-border rounded-2xl p-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-7 h-7 text-primary-light" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-semibold">Crafting your proposal…</p>
            <p className="text-muted-foreground text-sm mt-1">Personalising it for {company || "this company"}</p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
        </div>
      )}

      {!generating && (
        <>
          {/* Recipient (only shown when there IS an email) */}
          {hasEmail && (
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" /> Recipient
              </h2>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={e => setToEmail(e.target.value)}
                  placeholder="hiring@company.com"
                  className="w-full pl-4 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
                />
                {emailParam && toEmail === emailParam && (
                  <p className="text-xs text-accent mt-1.5">✓ Pre-filled from lead data</p>
                )}
              </div>
            </div>
          )}

          {/* No-email: manual email entry */}
          {!hasEmail && (
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Found an email?
              </h2>
              <p className="text-xs text-muted-foreground">If you found a contact email on their website or business profile, enter it here to prepare a Gmail draft.</p>
              <input
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder="hiring@company.com (optional)"
                className="w-full pl-4 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
              />
            </div>
          )}

          {/* Proposal editor */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-light" /> Proposal
              {!hasEmail && <span className="text-xs text-muted-foreground font-normal">— copy and use for manual outreach</span>}
            </h2>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Compelling subject line…"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Proposal Body</label>
                <button onClick={() => setPreview(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {preview ? <><EyeOff className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
                </button>
              </div>
              {preview ? (
                <div className="bg-background border border-border rounded-xl p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[280px]">
                  {body}
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={14}
                  placeholder="Your proposal will appear here…"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm resize-none leading-relaxed transition-all"
                />
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                {body.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {prepared && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-sm text-accent flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Prepared in Gmail</p>
                <p className="text-xs text-muted-foreground mt-0.5">Review the draft in Gmail and click Send there. iCloseLeads logged this as prepared outreach.</p>
                {composeUrl && (
                  <a href={composeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline mt-1">
                    Reopen Gmail compose <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {usage && (
            <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{usage.label} outreach safety limit</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prepare up to {usage.monthly} Gmail emails/month, capped at {usage.daily}/day and {usage.perMinute}/minute.
                  </p>
                </div>
                <span className="text-xs font-semibold text-accent whitespace-nowrap">
                  {usage.remainingThisMonth} left
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Today</span><span>{usage.usedToday}/{usage.daily}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary-light" style={{ width: `${dailyPct}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>This month</span><span>{usage.usedThisMonth}/{usage.monthly}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-accent" style={{ width: `${monthPct}%` }} /></div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Safe mode opens Gmail with the email pre-filled. You stay in control and press Send manually inside Gmail.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => void generate()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 text-primary-light hover:bg-primary/10 font-semibold text-sm transition-all">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>

            {body && <CopyButton text={`${subject}\n\n${body}`} />}

            {/* Safe Gmail prepare flow — primary free-plan action */}
            <button
              onClick={() => void handlePrepareInGmail()}
              disabled={preparing || !toEmail || !subject || !body}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ml-auto">
              {preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {preparing ? "Opening Gmail…" : toEmail ? "Prepare in Gmail" : "Enter email to prepare"}
            </button>
          </div>

          {/* Apply on source website shortcut (bottom, for no-email) */}
          {!hasEmail && jobUrl && (
            <div className="flex items-center justify-center pt-2 pb-4">
              <a href={jobUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-4 h-4" />
                Or open the {isLocalBusinessLead ? "business profile" : "source page"}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
        <p className="text-sm">Loading proposal…</p>
      </div>
    }>
      <NewProposalInner />
    </Suspense>
  );
}
