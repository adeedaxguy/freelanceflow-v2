"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, Lock, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || attempts >= 5) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email:    email.trim().toLowerCase(),
      password: password,
      redirect: false,
    });

    if (result?.ok) {
      // Verify the logged-in user is actually an admin
      const res  = await fetch("/api/admin/verify-role");
      const data = await res.json() as { isAdmin?: boolean };
      if (data.isAdmin) {
        router.push("/admin");
      } else {
        await fetch("/api/auth/signout", { method: "POST" });
        setError("This account does not have admin access.");
        setAttempts(a => a + 1);
      }
    } else {
      setAttempts(a => a + 1);
      setError(
        attempts >= 4
          ? "Too many failed attempts. Please wait before trying again."
          : "Invalid email or password."
      );
    }
    setLoading(false);
  };

  const locked = attempts >= 5;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" href="/" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Admin Portal</span>
          </div>
          <p className="text-muted-foreground text-sm">Restricted Access — Authorised Personnel Only</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Security banner */}
          <div className="flex items-center gap-2 px-5 py-3 bg-red-500/5 border-b border-red-500/20">
            <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <p className="text-[11px] text-red-400 font-medium">
              This area is restricted to authorised administrators only. All access is logged.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@icloseleads.com"
                required
                disabled={locked}
                autoComplete="username"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={locked}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Attempt counter */}
            {attempts > 0 && !locked && (
              <p className="text-xs text-muted-foreground">
                {5 - attempts} attempt{5 - attempts !== 1 ? "s" : ""} remaining before lockout
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || locked || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                : locked
                  ? <><Lock className="w-4 h-4" /> Account Locked</>
                  : <><Shield className="w-4 h-4" /> Sign In to Admin Panel</>}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-5 text-center">
            <p className="text-xs text-muted-foreground">
              Not an admin?{" "}
              <a href="/dashboard" className="text-primary-light hover:underline">
                Go to user dashboard
              </a>
            </p>
          </div>
        </div>

        {/* Subtle branding */}
        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          iCloseLeads Admin Portal · All access is monitored and logged
        </p>
      </div>
    </div>
  );
}
