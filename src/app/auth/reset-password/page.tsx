"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import Logo from "@/components/Logo";

function PasswordRecoveryForm() {
  const params = useSearchParams();
  const token = params.get("token")?.trim() || "";
  const isReset = Boolean(token);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (isReset && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(isReset ? "/api/auth/reset-password" : "/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isReset ? { token, password } : { email }),
      });
      const body = await res.json() as { error?: string; message?: string };
      if (!res.ok) throw new Error(body.error || "Please try again.");
      setSuccess(body.message || "Done.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo href="/" showText size="md" /></div>
        <section className="rounded-[14px] border border-border bg-card p-6 shadow-[0_18px_48px_rgba(0,0,0,0.16)] sm:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-light">
            {isReset ? <LockKeyhole className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {isReset ? "Choose a new password" : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isReset
              ? "Use at least 10 characters. Afterward, you can sign in with your email even if you originally joined with Google or GitHub."
              : "Enter the email connected to your account. We will send a secure one-time link if the account exists."}
          </p>

          {success ? (
            <div className="mt-7" role="status">
              <div className="flex items-start gap-3 rounded-lg border border-accent/25 bg-accent/10 p-4 text-sm leading-6 text-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-accent" />
                <p>{success}</p>
              </div>
              {isReset ? (
                <Link href="/auth" className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-light">
                  Sign in with your new password <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Check spam or promotions if the message does not appear within a few minutes.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {!isReset ? (
                <div>
                  <label htmlFor="recovery-email" className="mb-1.5 block text-sm font-medium text-muted-foreground">Email address</label>
                  <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 sm:text-sm" />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-muted-foreground">New password</label>
                    <div className="relative">
                      <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 10 characters" className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 sm:text-sm" />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-muted-foreground">Confirm password</label>
                    <input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={10} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your new password" className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 sm:text-sm" />
                  </div>
                </>
              )}

              {error && <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-5 text-destructive">{error}</p>}

              <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Working..." : isReset ? "Set new password" : "Send reset link"}
              </button>
            </form>
          )}

          <Link href="/auth" className="mt-6 flex min-h-10 items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function PasswordRecoveryPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary-light" /></main>}>
      <PasswordRecoveryForm />
    </Suspense>
  );
}
