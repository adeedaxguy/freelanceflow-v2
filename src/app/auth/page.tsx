"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Check, Loader2, Chrome, Zap } from "lucide-react";
import Link from "next/link";
import { NICHES } from "@/types";
import Logo from "@/components/Logo";

const REFERRAL_OPTIONS = [
  "Google Search", "Reddit", "Twitter / X", "LinkedIn", "Friend / Referral",
  "YouTube", "ProductHunt", "Newsletter", "Other",
];

function strengthLabel(p: string): { label: string; color: string; width: string } {
  if (!p) return { label: "", color: "bg-border", width: "0%" };
  if (p.length < 6)  return { label: "Too short", color: "bg-destructive", width: "20%" };
  if (p.length < 8)  return { label: "Weak",       color: "bg-orange-500",  width: "40%" };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Fair", color: "bg-gold", width: "60%" };
  return { label: "Strong", color: "bg-accent", width: "100%" };
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode,      setMode]      = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [step,      setStep]      = useState(1);
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,     setError]     = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [referral,  setReferral]  = useState("");
  // Prefill plan from URL params
  const planParam = params.get("plan") ?? "";

  // Sync mode from URL
  useEffect(() => {
    const m = params.get("mode");
    if (m === "signup") setMode("signup");
  }, [params]);

  const strength = strengthLabel(password);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    if (mode === "signin") {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) { setError("Invalid email or password"); setLoading(false); return; }
      router.push("/dashboard");
      return;
    }
    // Sign up — validate then go to onboarding step
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep(2);
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, expertise, referralSource: referral, plan: planParam }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) throw new Error("Login after registration failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally { setLoading(false); }
  };

  const toggleExpertise = (id: string) => {
    setExpertise(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id].slice(0, 4));
  };

  const hasGoogle = true; // Google button shown always; will gracefully fail if not configured

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-gradient-card border-r border-border p-12 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <Logo href="/" showText size="md" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Join 10,000+ freelancers growing their income
          </div>
          <h2 className="text-4xl font-extrabold text-foreground leading-tight mb-4">
            Find your next<br /><span className="gradient-text">$10k client</span><br />in minutes.
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            AI-powered leads from 7 real sources, personalized proposals, and automated outreach — all in one place.
          </p>
          <div className="space-y-3">
            {[
              "20 free leads every week — no credit card",
              "AI proposals powered by Groq (free tier)",
              "25 source integrations across freelance and local leads",
              "Full CRM pipeline to track every deal",
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex -space-x-2 mb-3">
              {["A","B","C","D","E"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `hsl(${200 + i * 30}, 70%, 45%)` }}>{l}</div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground"><span className="text-foreground font-semibold">2,847 freelancers</span> signed up this month</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground relative z-10">© 2025 iCloseLeads. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Logo href="/" showText size="md" />
          </div>

          {step === 1 && (
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 mb-8">
              {(["signin", "signup"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-primary text-white shadow-glow-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h1 className="text-2xl font-extrabold text-foreground mb-6">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>

                {/* Google OAuth Button */}
                {hasGoogle && (
                  <div className="mb-5">
                    <button
                      type="button"
                      onClick={() => void handleGoogleSignIn()}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-surface hover:bg-surface/80 text-foreground text-sm font-medium transition-all disabled:opacity-60 hover:border-primary/30"
                    >
                      {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                      {mode === "signin" ? "Sign in with Google" : "Sign up with Google"}
                    </button>

                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-background px-3 text-muted-foreground">or continue with email</span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={e => void handleCredentials(e)} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
                        className="w-full px-4 py-3 pr-10 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-3.5 text-muted-foreground">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === "signup" && password && (
                      <div className="mt-2">
                        <div className="h-1 bg-border rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{strength.label}</p>
                      </div>
                    )}
                  </div>

                  {error && <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all shadow-glow-primary disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {mode === "signin" ? "Sign In" : "Continue →"}
                  </button>

                  {mode === "signin" ? (
                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <button type="button" onClick={() => setMode("signup")} className="text-primary-light hover:underline font-medium">Sign up free</button>
                    </p>
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <Link href="/terms" className="text-primary-light hover:underline">Terms</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-primary-light hover:underline">Privacy Policy</Link>.
                    </p>
                  )}
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={e => void handleSignup(e)} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      <span className="w-6 h-1.5 rounded-full bg-border" />
                      <span className="w-6 h-1.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary-light uppercase tracking-wider">Step 2 of 2</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-foreground">Tell us about yourself</h1>
                  <p className="text-muted-foreground text-sm mt-1">We use this to personalise your AI proposals and lead recommendations.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Your Expertise <span className="text-muted-foreground font-normal">(pick up to 4)</span></label>
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {NICHES.map(n => (
                      <button key={n.id} type="button" onClick={() => toggleExpertise(n.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${
                          expertise.includes(n.id) ? "bg-primary/15 border-primary/50 text-primary-light" : "bg-surface border-border text-muted-foreground hover:border-primary/30"
                        }`}>
                        <span>{n.icon}</span> {n.label}
                        {expertise.includes(n.id) && <Check className="w-3 h-3 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">How did you find iCloseLeads?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {REFERRAL_OPTIONS.map(r => (
                      <button key={r} type="button" onClick={() => setReferral(r)}
                        className={`px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                          referral === r ? "bg-accent/15 border-accent/40 text-accent" : "bg-surface border-border text-muted-foreground hover:border-accent/20"
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-hero text-white font-semibold transition-all shadow-glow-primary disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Launch My Dashboard
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-light" /></div>}>
      <AuthForm />
    </Suspense>
  );
}
