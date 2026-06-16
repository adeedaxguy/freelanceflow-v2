"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Sparkles, Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
  ArrowLeft, RefreshCw, Copy, Link as LinkIcon, Mail, ExternalLink,
  FileText, Globe,
} from "lucide-react";
import Link from "next/link";

interface PortfolioLink { label: string; url: string; }
interface OutreachUsage {
  daily: number;
  monthly: number;
  perMinute: number;
  label: string;
  usedToday: number;
  usedThisMonth: number;
  remainingThisMonth: number;
}
interface PrepareResponse {
  success?: boolean;
  composeUrl?: string;
  usage?: OutreachUsage;
  error?: string;
}
interface Lead {
  company: string;
  domain: string;
  email?: string | null;
  niche?: string | null;
  title?: string | null;
  sourceUrl?: string | null;
}

function ProposalBuilder({ leadId }: { leadId: string }) {
  const [lead,         setLead]         = useState<Lead | null>(null);
  const [subject,      setSubject]       = useState("");
  const [body,         setBody]          = useState("");
  const [preview,      setPreview]       = useState(false);
  const [generating,   setGenerating]    = useState(false);
  const [preparing,    setPreparing]     = useState(false);
  const [prepared,     setPrepared]      = useState(false);
  const [error,        setError]         = useState("");
  const [aiSource,     setAiSource]      = useState<string | null>(null);
  const [toEmail,      setToEmail]       = useState("");
  const [copied,       setCopied]        = useState(false);
  const [portfolioUrl, setPortfolioUrl]  = useState("");
  const [savedLinks,   setSavedLinks]    = useState<PortfolioLink[]>([]);
  const [loadingLead,  setLoadingLead]   = useState(true);
  const [usage,        setUsage]         = useState<OutreachUsage | null>(null);
  const [composeUrl,   setComposeUrl]    = useState("");

  // Load lead + user portfolio links in parallel
  useEffect(() => {
    Promise.all([
      fetch(`/api/leads/save?id=${leadId}`).then(r => r.json() as Promise<{ lead?: Lead }>),
      fetch("/api/user/profile").then(r => r.json() as Promise<{ user?: { portfolio?: string | null; portfolioLinks?: string | PortfolioLink[] } }>),
    ]).then(([leadData, profileData]) => {
      if (leadData.lead) {
        setLead(leadData.lead);
        if (leadData.lead.email) setToEmail(leadData.lead.email);
      }
      if (profileData.user?.portfolio) setPortfolioUrl(profileData.user.portfolio);
      if (profileData.user?.portfolioLinks) {
        try {
          const links = typeof profileData.user.portfolioLinks === "string"
            ? (JSON.parse(profileData.user.portfolioLinks) as PortfolioLink[])
            : profileData.user.portfolioLinks;
          if (Array.isArray(links)) setSavedLinks(links);
        } catch { /* ignore */ }
      }
    }).catch(() => {/* non-fatal */}).finally(() => setLoadingLead(false));
  }, [leadId]);

  useEffect(() => {
    fetch("/api/email/usage")
      .then(r => r.ok ? r.json() as Promise<{ usage?: OutreachUsage }> : null)
      .then(d => { if (d?.usage) setUsage(d.usage); })
      .catch(() => null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!lead) return;
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle:       lead.title ?? "Freelance Project",
          company:        lead.company,
          description:    lead.domain ?? "",
          niche:          lead.niche ?? "",
          portfolioLinks: savedLinks,
        }),
      });
      const data = await res.json() as { subject?: string; body?: string; source?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSubject(data.subject ?? "");
      setBody(data.body ?? "");
      setAiSource(data.source ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [lead, savedLinks]);

  // Auto-generate once lead is loaded
  useEffect(() => {
    if (lead && !body && !loadingLead) void handleGenerate();
  }, [lead, loadingLead]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePrepareInGmail() {
    if (!toEmail) { setError("Please enter the recipient's email address."); return; }
    if (!subject) { setError("Subject line is required."); return; }
    if (!body)    { setError("Proposal body is required."); return; }

    const composeWindow = window.open("about:blank", "_blank");
    setPreparing(true); setError(""); setComposeUrl("");
    try {
      const res = await fetch("/api/email/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toEmail,
          subject,
          body,
          leadId,
          company: lead?.company,
          domain: lead?.domain,
        }),
      });
      const d = await res.json() as PrepareResponse;
      if (!res.ok || !d.composeUrl) throw new Error(d.error ?? "Could not prepare Gmail compose");
      if (d.usage) setUsage(d.usage);
      setPrepared(true);
      setComposeUrl(d.composeUrl);
      if (composeWindow) {
        composeWindow.location.href = d.composeUrl;
      } else {
        window.open(d.composeUrl, "_blank");
      }
    } catch (e) {
      if (composeWindow) composeWindow.close();
      setError(e instanceof Error ? e.message : "Could not prepare Gmail compose.");
    } finally {
      setPreparing(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasEmail = Boolean(toEmail);
  const noEmail  = !hasEmail && lead && !lead.email;
  const dailyPct = usage ? Math.min(100, Math.round((usage.usedToday / usage.daily) * 100)) : 0;
  const monthPct = usage ? Math.min(100, Math.round((usage.usedThisMonth / usage.monthly) * 100)) : 0;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5 pb-16">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/dashboard/saved-leads"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Proposal Builder</h1>
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
          <p className="text-muted-foreground text-sm mt-0.5 truncate">
            {lead ? `Crafting for ${lead.company}` : "Loading lead…"}
          </p>
        </div>
      </div>

      {/* Lead card */}
      {lead && (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-light font-bold flex-shrink-0 text-sm">
            {lead.company[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm truncate">{lead.company}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-muted-foreground text-xs">{lead.domain}</p>
              {lead.title && <span className="text-xs text-muted-foreground">· {lead.title}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {lead.niche && (
              <span className="hidden sm:inline px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary-light border border-primary/20">
                {lead.niche}
              </span>
            )}
            {lead.sourceUrl && (
              <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                title="View original posting">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* No-email banner */}
      {noEmail && !generating && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-300">No email found for this lead</p>
            <p className="text-xs text-yellow-400/80 mt-0.5">
              You can still generate a proposal and copy it for manual outreach via LinkedIn, their website contact form, or a job board message.
            </p>
          </div>
        </div>
      )}

      {/* Generating state */}
      {generating && (
        <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-primary-light" />
          </div>
          <p className="text-foreground font-semibold">Crafting your proposal…</p>
          <p className="text-muted-foreground text-xs">AI is personalizing this for {lead?.company ?? "this lead"}</p>
          <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
        </div>
      )}

      {!generating && (
        <>
          {/* Recipient */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-light" /> Recipient
            </h2>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Email Address {!noEmail && "*"}
                {noEmail && <span className="ml-1 text-yellow-400">(optional — enter manually if known)</span>}
              </label>
              <input
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                placeholder={noEmail ? "Not found — enter if available…" : "hiring@company.com"}
                className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all ${
                  noEmail ? "border-yellow-500/30" : "border-border"
                }`}
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                <Globe className="w-3 h-3" /> Your Portfolio URL
                <span className="text-muted-foreground/60 font-normal ml-1">(embedded in proposal)</span>
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 text-sm transition-all"
              />
              {savedLinks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {savedLinks.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary/20 transition-colors">
                      <LinkIcon className="w-2.5 h-2.5" /> {l.label}
                    </a>
                  ))}
                  <span className="text-[10px] text-muted-foreground self-center">← auto-included in AI</span>
                </div>
              )}
            </div>
          </div>

          {/* Proposal */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> Proposal
              </h2>
              <button onClick={() => setPreview(p => !p)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {preview ? <><EyeOff className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 text-sm transition-all"
                placeholder="Subject line…"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Body</label>
              {preview ? (
                <div className="bg-background border border-border rounded-xl p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[260px]">
                  {body}
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={14}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/60 text-sm resize-none leading-relaxed transition-all"
                  placeholder="Proposal body…"
                />
              )}
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-muted-foreground">{body.split(/\s+/).filter(Boolean).length} words</p>
                {body && (
                  <button onClick={() => void handleCopy()}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <><CheckCircle className="w-3 h-3 text-accent" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {prepared && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Prepared in Gmail</p>
                <p className="text-xs text-muted-foreground mt-0.5">Review the message in Gmail and click Send there. This is logged in Outreach History.</p>
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
                <span className="text-xs font-semibold text-accent whitespace-nowrap">{usage.remainingThisMonth} left</span>
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
          <div className="flex flex-wrap gap-3 pb-4">
            <button onClick={() => void handleGenerate()} disabled={generating || !lead}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/30 text-primary-light hover:bg-primary/10 font-semibold text-sm transition-all disabled:opacity-50">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>

            {hasEmail ? (
              <>
                <button
                  onClick={() => void handleCopy()}
                  disabled={!body || !subject}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 font-semibold text-sm transition-all disabled:opacity-50">
                  {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Proposal</>}
                </button>
                <button
                  onClick={() => void handlePrepareInGmail()}
                  disabled={!body || !subject || preparing}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50 ml-auto">
                  {preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {preparing ? "Opening Gmail…" : "Prepare in Gmail"}
                </button>
              </>
            ) : (
              <button
                onClick={() => void handleCopy()}
                disabled={!body || !subject}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-hero text-white font-bold text-sm transition-all shadow-glow-primary hover:opacity-90 disabled:opacity-50">
                {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy for Manual Outreach</>}
              </button>
            )}
          </div>

          {/* No-email instructions */}
          {noEmail && body && (
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">📋 Manual Outreach Options</h3>
              <p className="text-xs text-muted-foreground">Since there&apos;s no direct email, here are the best ways to reach this lead:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Globe, label: "Company Website", hint: "Use their contact form" },
                  { icon: LinkIcon, label: "LinkedIn", hint: "Find the hiring manager" },
                  { icon: ExternalLink, label: "Job Board", hint: "Reply on the original post" },
                ].map(({ icon: Icon, label, hint }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-background border border-border">
                    <Icon className="w-4 h-4 text-primary-light flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
                    </div>
                  </div>
                ))}
              </div>
              {lead?.sourceUrl && (
                <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-accent hover:underline">
                  <ExternalLink className="w-3 h-3" /> View original job posting
                </a>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}

interface PageProps { params: Promise<{ leadId: string }> }

export default async function ProposalPage({ params }: PageProps) {
  const { leadId } = await params;
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
      </div>
    }>
      <ProposalBuilder leadId={leadId} />
    </Suspense>
  );
}
