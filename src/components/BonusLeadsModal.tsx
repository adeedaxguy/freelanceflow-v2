"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Gift, Share2, Bell, Check, Copy, Loader2,
  MessageCircle, Zap, ChevronRight,
} from "lucide-react";

interface BonusLeadsModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onBonusClaimed: (newBonusLeads: number) => void;
  source:       string; // "live-jobs" | "remote-leads" | "local-leads"
  currentPlan:  string;
}

type Step = "choose" | "subscribe" | "share" | "done";

export default function BonusLeadsModal({
  isOpen, onClose, onBonusClaimed, source, currentPlan,
}: BonusLeadsModalProps) {
  const [step,       setStep]      = useState<Step>("choose");
  const [whatsapp,   setWhatsapp]  = useState("");
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [result,     setResult]    = useState<{ bonusLeads: number; referralUrl: string; referralCode: string } | null>(null);
  const [copied,     setCopied]    = useState(false);

  async function claimBonus(action: "subscribe" | "share") {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/leads/claim-bonus", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, whatsapp: whatsapp.trim() || undefined, source }),
      });
      const data = await res.json() as {
        success?: boolean; alreadyClaimed?: boolean;
        bonusLeads?: number; referralUrl?: string; referralCode?: string; message?: string; error?: string;
      };
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (data.alreadyClaimed) { setError("You already claimed this bonus."); setLoading(false); return; }
      setResult({ bonusLeads: data.bonusLeads ?? 0, referralUrl: data.referralUrl ?? "", referralCode: data.referralCode ?? "" });
      onBonusClaimed(data.bonusLeads ?? 0);
      setStep("done");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  function handleShare(platform: "linkedin" | "twitter") {
    const text = encodeURIComponent(`Just found a free tool that finds freelance clients automatically — up to 25 source integrations, AI proposals, local business leads. Try it: ${result?.referralUrl ?? "https://icloseleads.com"}`);
    const url = platform === "linkedin"
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(result?.referralUrl ?? "https://icloseleads.com")}`
      : `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, "_blank", "width=600,height=500");
    claimBonus("share");
  }

  function copyReferral() {
    void navigator.clipboard.writeText(result?.referralUrl ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() { setStep("choose"); setWhatsapp(""); setError(""); setLoading(false); }

  const sourceLabel = source === "live-jobs" ? "Live Jobs" : source === "local-leads" ? "Local Business Leads" : "Remote Leads";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
              {/* Close */}
              <button onClick={() => { reset(); onClose(); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              {/* ── STEP: CHOOSE ─────────────────────────────────── */}
              {step === "choose" && (
                <div className="p-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                      <Gift className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-extrabold text-foreground mb-2">
                      You've hit your {sourceLabel} limit
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Do one quick thing below and unlock <strong className="text-foreground">+300 free leads</strong> instantly — no payment needed.
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {/* Subscribe option */}
                    <button onClick={() => setStep("subscribe")}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors">
                        <Bell className="w-5 h-5 text-primary-light" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-sm">Subscribe + WhatsApp</div>
                        <div className="text-muted-foreground text-xs mt-0.5">Weekly lead digest + early Pro access</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-accent text-xs font-bold whitespace-nowrap">
                        <Zap className="w-3.5 h-3.5" />+300 leads
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>

                    {/* Share option */}
                    <button onClick={() => setStep("share")}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/25 transition-colors">
                        <Share2 className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground text-sm">Share on LinkedIn or Twitter</div>
                        <div className="text-muted-foreground text-xs mt-0.5">Share iCloseLeads with your network</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-accent text-xs font-bold whitespace-nowrap">
                        <Zap className="w-3.5 h-3.5" />+300 leads
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>

                    {/* Do both */}
                    <p className="text-center text-xs text-muted-foreground">
                      Do both and unlock <strong className="text-foreground">+600 leads total</strong>
                    </p>
                  </div>

                  {/* Pro upsell */}
                  <div className="mt-5 p-3 rounded-xl bg-gold/5 border border-gold/20 text-center">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-gold font-semibold">Pro plan launching soon</span> — unlimited leads forever.{" "}
                      <button onClick={() => setStep("subscribe")} className="text-primary-light underline">
                        Get notified first
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* ── STEP: SUBSCRIBE ──────────────────────────────── */}
              {step === "subscribe" && (
                <div className="p-6">
                  <button onClick={() => setStep("choose")} className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
                    ← Back
                  </button>
                  <div className="text-center mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-primary-light" />
                    </div>
                    <h3 className="font-extrabold text-foreground text-lg mb-1">Unlock +300 leads</h3>
                    <p className="text-muted-foreground text-sm">
                      Subscribe for weekly lead tips and enter your WhatsApp for Pro launch early access.
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        WhatsApp Number <span className="text-muted-foreground/50 font-normal">(optional but recommended)</span>
                      </label>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-2.5 bg-muted/30 border border-border rounded-l-xl text-sm text-muted-foreground border-r-0">
                          <MessageCircle className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={e => setWhatsapp(e.target.value)}
                          placeholder="+44 7700 900000"
                          className="flex-1 px-3 py-2.5 bg-background border border-border rounded-r-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">We'll send you weekly lead digests and Pro launch updates via WhatsApp.</p>
                    </div>
                  </div>

                  {error && <p className="text-destructive text-xs mb-3">{error}</p>}

                  <button onClick={() => void claimBonus("subscribe")} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-light transition-all shadow-glow-primary disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Unlock +300 Leads Free
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-2">No spam. Unsubscribe anytime.</p>
                </div>
              )}

              {/* ── STEP: SHARE ──────────────────────────────────── */}
              {step === "share" && (
                <div className="p-6">
                  <button onClick={() => setStep("choose")} className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
                    ← Back
                  </button>
                  <div className="text-center mb-5">
                    <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-3">
                      <Share2 className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-extrabold text-foreground text-lg mb-1">Share & Unlock +300 Leads</h3>
                    <p className="text-muted-foreground text-sm">Share iCloseLeads with your network. Click share below — leads unlock instantly.</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <button onClick={() => handleShare("linkedin")}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#0077B5]/30 bg-[#0077B5]/5 hover:bg-[#0077B5]/10 transition-all text-left">
                      <div className="w-9 h-9 rounded-lg bg-[#0077B5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">in</div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">Share on LinkedIn</div>
                        <div className="text-muted-foreground text-xs">Reach your professional network</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </button>

                    <button onClick={() => handleShare("twitter")}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-foreground/10 bg-foreground/3 hover:bg-foreground/5 transition-all text-left">
                      <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center text-background text-xs font-bold flex-shrink-0">𝕏</div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">Share on Twitter / X</div>
                        <div className="text-muted-foreground text-xs">Tweet to your followers</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </button>
                  </div>
                  {error && <p className="text-destructive text-xs">{error}</p>}
                </div>
              )}

              {/* ── STEP: DONE ───────────────────────────────────── */}
              {step === "done" && result && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground mb-2">
                    🎉 +300 leads unlocked!
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Your new limit is active immediately. Keep going — your leads are waiting.
                  </p>

                  {/* Referral bonus */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 text-left">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-primary-light" />
                      Refer a friend → get another +300 leads free
                    </p>
                    <div className="flex gap-2">
                      <input readOnly value={result.referralUrl}
                        className="flex-1 min-w-0 px-3 py-2 text-xs bg-background border border-border rounded-lg text-muted-foreground truncate" />
                      <button onClick={copyReferral}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-light transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <button onClick={() => { reset(); onClose(); }}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-light transition-all shadow-glow-primary">
                    Back to Leads
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
