"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Globe, Loader2, Pause, PhoneCall, Play, Plus, RefreshCw, Search, Settings2, ShieldCheck, X } from "lucide-react";
import { requestJson } from "@/lib/client-request";
import { CALL_ZONES, COUNTRIES, LOFTS_PROFILE, type CallingAttempt, type CallingCampaign, type CallingLead, type CallingSetup } from "@/lib/admin-calling-model";

type Snapshot = { setup: CallingSetup; campaigns: CallingCampaign[]; attempts: CallingAttempt[]; existingNumbers?: Options["numbers"] };
type Options = { numbers: { phone_number_id: string; phone_number: string; label: string }[]; voices: { id: string; name: string; accent: string }[] };
const inputClass = "w-full min-w-0 rounded-md border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 disabled:opacity-50";
const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed";
const primaryClass = `${buttonClass} bg-primary text-white hover:bg-primary/90`;
const initialSetup: CallingSetup = { profile: LOFTS_PROFILE, connected: false, ready: false, voiceId: "", phoneId: "", agentId: "" };
const post = <T,>(body: unknown) => requestJson<T>("/api/admin/calling", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(58000) });
const editableSetup = (value: CallingSetup) => JSON.stringify({ profile: value.profile, voiceId: value.voiceId, phoneId: value.phoneId });
const localDateInput = (iso: string) => { const date = new Date(iso); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export default function AdminCallingClient() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [setup, setSetup] = useState(initialSetup);
  const [tab, setTab] = useState<"campaigns" | "setup">("campaigns");
  const [selected, setSelected] = useState("");
  const [selectedLead, setSelectedLead] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [options, setOptions] = useState<Options>({ numbers: [], voices: [] });
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState<"AU" | "CA">("AU");
  const [timezone, setTimezone] = useState<string>(CALL_ZONES.AU[0]);
  const [reviewed, setReviewed] = useState(false);
  const [consentLead, setConsentLead] = useState<CallingLead | null>(null);
  const [evidence, setEvidence] = useState("");
  const [consentDate, setConsentDate] = useState("");
  const [confirmedConsent, setConfirmedConsent] = useState(false);
  const [verifiedCountry, setVerifiedCountry] = useState(false);
  const [testName, setTestName] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testAllowed, setTestAllowed] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [recoveryEvidence, setRecoveryEvidence] = useState("");
  const [providerReviewed, setProviderReviewed] = useState(false);
  const [operatorTimezone, setOperatorTimezone] = useState("browser local time");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mounted = useRef(true);
  const campaign = snapshot?.campaigns.find(c => c.id === selected);
  const lead = campaign?.leads.find(l => l.id === selectedLead);
  const attempt = snapshot?.attempts.find(a => a.campaignId === selected && a.leadId === selectedLead);
  const activeRun = snapshot?.campaigns.find(c => c.status === "running");
  const setupDirty = Boolean(snapshot && (apiKey || editableSetup(setup) !== editableSetup(snapshot.setup)));
  const outgoingNumbers = [...(snapshot?.existingNumbers || []), ...options.numbers.filter(n => !snapshot?.existingNumbers?.some(e => e.phone_number_id === n.phone_number_id))];

  const load = useCallback(async (replaceSetup = false) => {
    const data = await requestJson<Snapshot>("/api/admin/calling");
    if (!mounted.current) return;
    setSnapshot(data);
    if (replaceSetup) setSetup(data.setup);
    setSelected(value => value || data.campaigns[0]?.id || "");
  }, []);
  useEffect(() => {
    mounted.current = true;
    setOperatorTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    void load(true).catch(e => setError(e.message));
    return () => { mounted.current = false; };
  }, [load]);
  useEffect(() => { setReviewed(false); setRecoveryEvidence(""); setProviderReviewed(false); }, [selected]);
  useEffect(() => { setSelectedLead(value => campaign?.leads.some(l => l.id === value) ? value : campaign?.leads[0]?.id || ""); }, [selected, campaign?.leads]);
  useEffect(() => {
    if (consentLead) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [consentLead]);

  async function act(label: string, body: unknown, replaceSetup = false) {
    setBusy(label); setError(""); setNotice("");
    try {
      await post(body);
      await load(replaceSetup);
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed. Please retry."); return false; }
    finally { setBusy(""); }
  }

  // Supervised pilot: leaving this page stops dispatching new calls. Existing calls
  // are still reconciled on return, and no automatic retries are made.
  useEffect(() => {
    if (!runId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const data = await post<Snapshot>({ action: "tick", campaignId: runId });
        if (stopped || !mounted.current) return;
        setSnapshot(data);
        if (data.campaigns.find(c => c.id === runId)?.status !== "running") { setRunId(null); return; }
        timer = setTimeout(tick, 12000);
      } catch (e) {
        if (stopped) return;
        setError(e instanceof Error ? e.message : "Campaign stopped. Refresh call status before continuing.");
        setRunId(null);
        await post({ action: "pause", campaignId: runId }).catch(() => undefined);
      }
    };
    void tick();
    return () => { stopped = true; clearTimeout(timer); };
  }, [runId]);

  async function search(event: React.FormEvent) {
    event.preventDefault(); setBusy("Finding businesses"); setError(""); setNotice("");
    try {
      const data = await post<{ campaign: CallingCampaign }>({ action: "search", campaign: { category, city, country, timezone } });
      setSelected(data.campaign.id); setSelectedLead(data.campaign.leads[0]?.id || "");
      await load();
      for (let i = 0; i < data.campaign.leads.length; i++) {
        if (!mounted.current) break;
        setBusy(`Researching ${i + 1} of ${data.campaign.leads.length}`);
        await post({ action: "research", campaignId: data.campaign.id, leadId: data.campaign.leads[i]!.id });
        await load();
      }
      setNotice(data.campaign.leads.length ? "Business briefs saved. Review evidence and consent before approving any calls." : "No direct numbers found. Your campaign is saved; try another search or add your test contact.");
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed. Saved results remain available."); }
    finally { setBusy(""); }
  }
  async function saveSetup() {
    const ok = await act("Saving setup", { action: "setup", profile: setup.profile, voiceId: setup.voiceId, phoneId: setup.phoneId, ...(apiKey ? { apiKey } : {}) }, true);
    if (ok) { setApiKey(""); setNotice("Saved. Connect ElevenLabs, select a voice and outgoing number, then verify the agent."); }
  }
  async function getOptions() {
    setBusy("Loading provider options"); setError("");
    try { setOptions(await post<Options>({ action: "options" })); }
    catch (e) { setError(e instanceof Error ? e.message : "Provider unavailable."); }
    finally { setBusy(""); }
  }
  function openConsent(item: CallingLead) {
    setConsentLead(item); setEvidence(item.consent?.evidence || ""); setConsentDate(item.consent ? localDateInput(item.consent.obtainedAt) : ""); setConfirmedConsent(false); setVerifiedCountry(false); setError("");
  }

  return <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-20 sm:px-8 lg:pt-8">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
      <div><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><h1 className="text-2xl font-semibold">AI Calling</h1><span className="flex items-center gap-2 text-xs font-medium text-emerald-500"><ShieldCheck size={15} /> Admin only <span className="text-muted-foreground">/ Supervised pilot</span></span></div><p className="mt-1 text-sm text-muted-foreground">Lofts Studio outreach · Australia &amp; Canada</p></div>
      <Link href="/dashboard/softphone" className={buttonClass}><PhoneCall size={16} /> Manual softphone <ArrowUpRight size={14} /></Link>
    </header>
    {activeRun && <div role="status" className="sticky top-14 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background py-3 lg:top-0"><div className="min-w-0 text-sm"><p className="font-semibold">Supervised run · {activeRun.category}, {activeRun.city}</p><p className="mt-1 text-xs text-muted-foreground">{runId === activeRun.id ? "Calling queue active. Pause stops the next call; a dispatched call may still finish." : "This tab is not dispatching new calls. Pause before restarting."}</p></div><button className={buttonClass} onClick={() => { setRunId(null); void act("Pausing next calls", { action: "pause", campaignId: activeRun.id }); }}><Pause size={16} /> Pause next calls</button></div>}
    <div className="my-5 flex flex-wrap items-center justify-between gap-3">
      <div role="tablist" aria-label="Calling workspace" className="flex gap-1">
        {(["campaigns", "setup"] as const).map(item => <button key={item} role="tab" tabIndex={tab === item ? 0 : -1} aria-selected={tab === item} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "campaigns" : event.key === "End" ? "setup" : tab === "campaigns" ? "setup" : "campaigns"; setTab(next); (event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next === "campaigns" ? 0 : 1])?.focus(); } }} onClick={() => setTab(item)} className={`${buttonClass} ${tab === item ? "border-primary bg-primary/10 text-primary-light" : "border-transparent"}`}>{item === "campaigns" ? <PhoneCall size={16} /> : <Settings2 size={16} />}{item === "campaigns" ? "Campaigns" : "Agent setup"}</button>)}
      </div>
      <span className={`text-xs ${snapshot?.setup.ready ? "text-emerald-500" : "text-amber-500"}`}>{snapshot?.setup.ready ? "Agent configured" : "Voice connection required"}</span>
    </div>
    {setupDirty && <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3 text-sm"><p>Unsaved agent changes. Calling is blocked until you save and verify, or discard the changes.</p><button className={buttonClass} disabled={Boolean(busy || activeRun)} onClick={() => { if (snapshot) setSetup(snapshot.setup); setApiKey(""); }}>Discard changes</button></div>}
    {error && !consentLead && <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400"><span className="min-w-0 break-words">{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button></div>}
    {(busy || notice) && <p role="status" aria-live="polite" className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">{busy && <Loader2 className="shrink-0 animate-spin motion-reduce:animate-none" size={16} />}{busy || notice}</p>}
    {!snapshot && !error && <p role="status" className="flex items-center gap-2 py-16 text-muted-foreground"><Loader2 size={18} className="animate-spin" /> Loading calling workspace</p>}
    {!snapshot && error && <button className={buttonClass} onClick={() => void load(true).catch(e => setError(e.message))}><RefreshCw size={16} /> Retry</button>}
    {snapshot && tab === "setup" && <fieldset disabled={Boolean(activeRun)} aria-label="Agent configuration" className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)]">
      <div className="space-y-5">
        <div><h2 className="text-lg font-semibold">Service knowledge</h2><a href="https://lofts.studio/" target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-primary-light">Source: lofts.studio <ArrowUpRight size={14} /></a></div>
        <label className="block space-y-1.5 text-sm">Business name<input className={inputClass} value={setup.profile.company} onChange={e => setSetup({ ...setup, profile: { ...setup.profile, company: e.target.value, approved: false } })} /></label>
        <label className="block space-y-1.5 text-sm">Services and approved facts<textarea rows={8} className={inputClass} value={setup.profile.services} onChange={e => setSetup({ ...setup, profile: { ...setup.profile, services: e.target.value, approved: false } })} /></label>
        <label className="block space-y-1.5 text-sm">Pricing and offer limits<textarea rows={4} className={inputClass} value={setup.profile.pricing} onChange={e => setSetup({ ...setup, profile: { ...setup.profile, pricing: e.target.value, approved: false } })} /></label>
        <label className="block space-y-1.5 text-sm">Contact email<input type="email" className={inputClass} value={setup.profile.contactEmail} onChange={e => setSetup({ ...setup, profile: { ...setup.profile, contactEmail: e.target.value, approved: false } })} /></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={setup.profile.approved} onChange={e => setSetup({ ...setup, profile: { ...setup.profile, approved: e.target.checked } })} />I approve these services, facts and offer limits for the agent.</label>
      </div>
      <div className="space-y-5 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <h2 className="text-lg font-semibold">Voice connection</h2>
        <label className="block space-y-1.5 text-sm">ElevenLabs API key<input type="password" autoComplete="new-password" className={inputClass} placeholder={setup.connected ? "Connected; leave blank to keep" : "Enter a restricted API key"} value={apiKey} onChange={e => setApiKey(e.target.value)} /></label>
        <button className={buttonClass} disabled={Boolean(busy || runId)} onClick={() => void saveSetup()}><Check size={16} /> Save setup</button>
        <div className="border-t border-border pt-5"><button className={buttonClass} disabled={!setup.connected || Boolean(busy || runId)} onClick={() => void getOptions()}><RefreshCw size={16} /> Load voices &amp; numbers</button></div>
        <label className="block space-y-1.5 text-sm">Female voice<select className={inputClass} value={setup.voiceId} onChange={e => setSetup({ ...setup, voiceId: e.target.value })}><option value="">Select a voice</option>{setup.voiceId && !options.voices.some(v => v.id === setup.voiceId) && <option value={setup.voiceId}>Saved voice</option>}{options.voices.map(v => <option key={v.id} value={v.id}>{v.name}{v.accent ? ` (${v.accent})` : ""}</option>)}</select></label>
        <label className="block space-y-1.5 text-sm">Outgoing Twilio number<select className={inputClass} value={setup.phoneId} onChange={e => setSetup({ ...setup, phoneId: e.target.value })}><option value="">Select an outgoing number</option>{setup.phoneId && !outgoingNumbers.some(n => n.phone_number_id === setup.phoneId) && <option value={setup.phoneId}>Saved number</option>}{outgoingNumbers.map(n => <option key={n.phone_number_id} value={n.phone_number_id}>{n.phone_number} · {n.label}</option>)}</select></label>
        <p className="text-xs leading-relaxed text-muted-foreground">Your existing softphone number keeps its incoming calls and manual calling. No ElevenLabs number import is needed. Voice, model and Twilio usage are billed separately.</p>
        <button className={primaryClass} disabled={Boolean(busy || runId) || !setup.connected || !setup.profile.approved || !setup.voiceId || !setup.phoneId} onClick={async () => { if (await act("Saving agent settings", { action: "setup", profile: setup.profile, voiceId: setup.voiceId, phoneId: setup.phoneId }, true)) { if (await act("Verifying voice agent", { action: "provision" }, true)) setNotice("Agent configured. Test on an owned, consenting number before a business campaign."); } }}><ShieldCheck size={16} /> Verify agent</button>
        <div className="border-t border-border pt-5 text-sm"><p className="font-medium">Pilot limits</p><ul className="mt-2 space-y-2 text-muted-foreground"><li>1 concurrent call · 3 minutes per call</li><li>10 calls / 30 reserved minutes per 24 hours</li><li>Weekdays, 10am–4pm recipient local time</li><li>Written notes; audio recording disabled</li><li>Meeting requests saved for human follow-up</li><li>Calendar booking and SMS not connected</li></ul></div>
      </div>
    </fieldset>}
    {snapshot && tab === "campaigns" && <>
      <form onSubmit={search} className="grid items-end gap-3 border-b border-border pb-6 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_0.8fr_1fr_auto]">
        <label className="space-y-1.5 text-xs font-medium">Business category<input required maxLength={100} className={inputClass} placeholder="e.g. dental clinics" value={category} onChange={e => setCategory(e.target.value)} /></label>
        <label className="space-y-1.5 text-xs font-medium">City / region<input required maxLength={100} className={inputClass} placeholder="e.g. Sydney, NSW" value={city} onChange={e => setCity(e.target.value)} /></label>
        <label className="space-y-1.5 text-xs font-medium">Country<select className={inputClass} value={country} onChange={e => { const value = e.target.value as "AU" | "CA"; setCountry(value); setTimezone(CALL_ZONES[value][0]); }}>{Object.entries(COUNTRIES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label className="space-y-1.5 text-xs font-medium">Recipient timezone<select className={inputClass} value={timezone} onChange={e => setTimezone(e.target.value)}>{CALL_ZONES[country].map(zone => <option key={zone}>{zone}</option>)}</select></label>
        <button className={primaryClass} disabled={Boolean(busy || runId)}>{busy.startsWith("Finding") || busy.startsWith("Researching") ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Find &amp; research</button>
      </form>
      <div className="grid gap-6 pt-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside aria-label="Saved campaigns" className="min-w-0"><h2 className="mb-3 text-sm font-semibold">Saved campaigns <span className="text-muted-foreground">{snapshot.campaigns.length}</span></h2>
          <div className="flex gap-2 overflow-x-auto pb-2 xl:flex-col">{snapshot.campaigns.map(c => <button key={c.id} disabled={Boolean(runId && runId !== c.id)} onClick={() => setSelected(c.id)} className={`min-w-[180px] rounded-md border p-3 text-left xl:min-w-0 ${selected === c.id ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/20"}`}><span className="block break-words text-sm font-medium">{c.category}</span><span className="mt-1 block text-xs text-muted-foreground">{c.city} · {c.country}</span><span className="mt-2 block text-xs text-muted-foreground">{c.leads.length} contacts · {c.status}</span></button>)}</div>
        </aside>
        <section className="min-w-0" aria-label="Campaign queue">
          {!campaign ? <div className="py-14"><PhoneCall size={28} className="mb-4 text-muted-foreground" /><h2 className="text-lg font-semibold">Prepare your first campaign</h2><p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Choose a category and city. Public listings can supply business details, but they do not supply consent for automated sales calls.</p><button className={`${buttonClass} mt-5`} onClick={() => setTab("setup")}><Settings2 size={16} /> Review Lofts Studio setup</button></div> : <>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{campaign.category} <span className="text-muted-foreground">/ {campaign.city}</span></h2><p className="mt-1 text-xs text-muted-foreground">{campaign.timezone} · {campaign.sources.join(", ") || "No discovery sources returned"}</p></div>
              <div className="flex gap-2"><button title="Refresh call status" aria-label="Refresh call status" className={buttonClass} disabled={Boolean(busy || runId)} onClick={() => void act("Refreshing call status", { action: "refresh" })}><RefreshCw size={16} /></button>{campaign.status !== "running" && <button className={primaryClass} disabled={!reviewed || Boolean(busy) || !snapshot.setup.ready || setupDirty} onClick={async () => { if (await act("Approving supervised run", { action: "start", campaignId: campaign.id, reviewedToday: true })) setRunId(campaign.id); }}><Play size={16} /> Start supervised run</button>}</div>
            </div>
            <label className="my-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" className="mt-0.5" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />I reviewed today's local public holidays, calling-list requirements and each contact's AI-call consent. I approve up to 10 calls, with provider usage charges. Keep this page open during the supervised run.</label>
            {campaign.lastMessage && <p role="status" className="mb-4 text-xs leading-relaxed text-muted-foreground">{campaign.lastMessage}{campaign.status === "running" && !runId ? " This tab is not dispatching. Pause, then start again to resume." : ""}</p>}
            <div className="grid border-y border-border lg:grid-cols-[minmax(220px,0.75fr)_minmax(0,1fr)]">
              <div className="max-h-[620px] overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">{campaign.leads.length === 0 && <p className="p-5 text-sm text-muted-foreground">No direct phone numbers found.</p>}{campaign.leads.map(item => {
                const call = snapshot.attempts.find(a => a.leadId === item.id && a.campaignId === campaign.id);
                return <button key={item.id} onClick={() => { setSelectedLead(item.id); setConversationId(""); }} className={`flex w-full items-start gap-3 border-b border-border/60 p-4 text-left last:border-0 ${item.id === selectedLead ? "bg-primary/10" : "hover:bg-muted/20"}`}><div className="min-w-0 flex-1"><span className="block break-words text-sm font-medium">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.phone}</span><span className={`mt-2 block text-xs ${item.suppressed ? "text-red-400" : item.consent ? "text-emerald-500" : "text-amber-500"}`}>{item.suppressed ? "Do not call" : call?.status || (item.consent ? "Consent recorded" : item.brief ? "Consent needed" : "Research pending")}</span></div><ChevronRight size={15} className="mt-1 shrink-0 text-muted-foreground" /></button>;
              })}</div>
              <div className="min-w-0 p-4 sm:p-5">{!lead ? <p className="text-sm text-muted-foreground">Select a business to review its brief.</p> : <>
                <h3 className="break-words text-base font-semibold">{lead.name}</h3><p className="mt-1 text-xs text-muted-foreground">{lead.address}</p>
                <div className="my-3 flex flex-wrap gap-3 text-xs">{[lead.website, lead.source].filter(Boolean).filter(url => /^https?:\/\//i.test(url)).map((url, i) => <a key={`${url}-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-light"><Globe size={13} />{i === 0 && lead.website ? "Website" : "Listing"}<ArrowUpRight size={12} /></a>)}</div>
                {lead.brief ? <div className="space-y-4 text-sm leading-relaxed"><div><h4 className="mb-1 text-xs font-semibold text-muted-foreground">BUSINESS BRIEF</h4><p className="break-words">{lead.brief.facts}</p></div><div><h4 className="mb-1 text-xs font-semibold text-muted-foreground">SUGGESTED OFFER</h4><p>{lead.brief.offer}</p></div><div><h4 className="mb-1 text-xs font-semibold text-muted-foreground">OPENING QUESTION</h4><p>{lead.brief.question}</p></div>{lead.brief.error && <p className="text-xs text-amber-500">{lead.brief.error}</p>}<p className="text-xs text-muted-foreground">Prepared {new Date(lead.brief.checkedAt).toLocaleString()} · Verify source evidence before calling.</p></div> : <p className="py-6 text-sm text-muted-foreground">Business research has not been prepared.</p>}
                <div className="mt-5 flex flex-wrap gap-2"><button className={buttonClass} disabled={Boolean(busy || runId) || campaign.status === "running" || Boolean(attempt)} onClick={() => void act("Researching business", { action: "research", campaignId: campaign.id, leadId: lead.id })}><RefreshCw size={15} />{lead.brief ? "Refresh brief" : "Research business"}</button><button className={buttonClass} disabled={!lead.brief || lead.suppressed || Boolean(attempt || busy || runId)} onClick={() => openConsent(lead)}><ShieldCheck size={15} />{lead.consent ? "Review consent" : "Record consent"}</button></div>
                {!lead.suppressed && <button className="mt-3 text-xs text-red-400 hover:underline" disabled={Boolean(busy)} onClick={() => void act("Adding do-not-call suppression", { action: "suppress", campaignId: campaign.id, leadId: lead.id })}>Add to do-not-call list</button>}
                {attempt && <div className="mt-6 border-t border-border pt-4"><h4 className="text-sm font-semibold">Call result · {attempt.status}</h4><p className="mt-2 text-sm leading-relaxed">{attempt.summary || "Awaiting provider result. Refresh call status after the call."}</p><p className="mt-2 break-all text-xs text-muted-foreground">{attempt.duration}s · {attempt.conversationId || "AI conversation pending"}{attempt.twilioCallSid && <><br />Twilio: {attempt.twilioCallSid}</>}</p>{attempt.transcript.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-sm text-primary-light">Transcript</summary><div className="mt-3 max-h-80 space-y-3 overflow-y-auto">{attempt.transcript.map((t, i) => <p key={i} className="text-xs leading-relaxed"><strong>{t.role === "user" ? "Prospect" : "Agent"}: </strong>{t.message}</p>)}</div></details>}
                  {["dispatching", "uncertain"].includes(attempt.status) && <div className="mt-3 space-y-2"><label className="block text-xs">Provider conversation ID<input className={`${inputClass} mt-1`} value={conversationId} onChange={e => setConversationId(e.target.value)} /></label><button disabled={Boolean(busy) || !conversationId} className={buttonClass} onClick={() => void act("Reconciling provider result", { action: "reconcile", campaignId: campaign.id, attemptId: attempt.id, conversationId })}><RefreshCw size={15} /> Reconcile call</button></div>}
                  {["dispatching", "uncertain"].includes(attempt.status) && !attempt.conversationId && <details className="mt-4 text-xs"><summary className="cursor-pointer">No AI conversation found?</summary><p className="my-2 leading-relaxed text-muted-foreground">After 15 minutes, review both providers before releasing this hold. Any linked Twilio call must be confirmed ended. This does not retry the number.</p><label className="block">Provider review evidence<textarea rows={3} className={`${inputClass} mt-1`} value={recoveryEvidence} onChange={e => setRecoveryEvidence(e.target.value)} /></label><label className="my-3 flex items-start gap-2"><input type="checkbox" checked={providerReviewed} onChange={e => setProviderReviewed(e.target.checked)} />I checked both providers and confirmed there is no active call.</label><button className={buttonClass} disabled={Boolean(busy) || !providerReviewed || recoveryEvidence.trim().length < 20 || Date.now() - Date.parse(attempt.createdAt) < 900000} onClick={() => void act("Recording provider review", { action: "resolve_unconfirmed", campaignId: campaign.id, attemptId: attempt.id, reviewedProvider: true, evidence: recoveryEvidence })}><ShieldCheck size={15} /> Release reviewed hold</button></details>}
                </div>}
              </>}</div>
            </div>
            <details className="mt-5 border-b border-border pb-5"><summary className="cursor-pointer text-sm font-medium">Add an owned test number</summary><form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={async e => { e.preventDefault(); if (await act("Adding test contact", { action: "test_contact", campaignId: campaign.id, name: testName, phone: testPhone, ownedOrConsenting: testAllowed })) { setTestName(""); setTestPhone(""); setTestAllowed(false); } }}><label className="text-xs">Test contact name<input required className={`${inputClass} mt-1`} value={testName} onChange={e => setTestName(e.target.value)} /></label><label className="text-xs">Number in {COUNTRIES[campaign.country]}<input type="tel" required className={`${inputClass} mt-1`} value={testPhone} onChange={e => setTestPhone(e.target.value)} /></label><label className="flex items-start gap-2 text-xs sm:col-span-2"><input type="checkbox" checked={testAllowed} onChange={e => setTestAllowed(e.target.checked)} />I own this number or its owner expressly agreed to this AI test call.</label><button className={`${buttonClass} justify-self-start`} disabled={!testAllowed || Boolean(busy || runId)}><Plus size={15} /> Add test contact</button></form></details>
          </>}
        </section>
      </div>
    </>}
    <dialog ref={dialogRef} onCancel={() => setConsentLead(null)} aria-labelledby="consent-title" className="w-[calc(100%_-_2rem)] max-w-lg rounded-lg border border-border bg-background p-5 text-foreground backdrop:bg-black/70">
      <div className="flex items-start justify-between gap-3"><h2 id="consent-title" className="text-lg font-semibold">AI-call consent</h2><button aria-label="Close consent" onClick={() => setConsentLead(null)}><X size={18} /></button></div>
      <p className="mt-2 text-sm text-muted-foreground">{consentLead?.name} · {consentLead?.phone}</p>
      {error && <p role="alert" className="mt-4 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">{error}</p>}
      <form className="mt-5 space-y-4" onSubmit={async e => { e.preventDefault(); if (!campaign || !consentLead) return; const obtainedAt = consentLead.consent && localDateInput(consentLead.consent.obtainedAt) === consentDate ? consentLead.consent.obtainedAt : new Date(consentDate).toISOString(); if (await act("Recording consent", { action: "approve", campaignId: campaign.id, leadId: consentLead.id, evidence, obtainedAt, expressAiConsent: confirmedConsent, countryVerified: verifiedCountry })) setConsentLead(null); }}>
        <label className="block space-y-1 text-sm">Consent evidence / reference<textarea required minLength={20} maxLength={1200} rows={4} autoFocus className={inputClass} placeholder="Record who agreed, the specific number, Lofts Studio, automated sales calls, and where the evidence is stored." value={evidence} onChange={e => setEvidence(e.target.value)} /></label>
        <label className="block space-y-1 text-sm">Consent obtained ({operatorTimezone})<input type="datetime-local" required className={inputClass} value={consentDate} onChange={e => setConsentDate(e.target.value)} /></label>
        <label className="flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={confirmedConsent} onChange={e => setConfirmedConsent(e.target.checked)} />This person expressly agreed to AI / synthesized-voice marketing calls from Lofts Studio to this specific number. A public listing is not consent.</label>
        <label className="flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={verifiedCountry} onChange={e => setVerifiedCountry(e.target.checked)} />I verified this direct number belongs to the intended business in {campaign && COUNTRIES[campaign.country]}, and {campaign?.timezone} is its actual local timezone.</label>
        <button className={primaryClass} disabled={!confirmedConsent || !verifiedCountry || Boolean(busy)}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Record approval</button>
      </form>
    </dialog>
  </div>;
}
