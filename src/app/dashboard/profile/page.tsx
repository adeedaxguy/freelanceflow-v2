"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Save, User, Briefcase, Globe, DollarSign, CheckCircle } from "lucide-react";
import { NICHES } from "@/types";

interface UserProfile {
  name: string | null;
  email: string;
  niche: string | null;
  bio: string | null;
  rate: number | null;
  portfolio: string | null;
  avatarUrl: string | null;
}

function completionScore(profile: UserProfile): number {
  const fields = [profile.name, profile.niche, profile.bio, profile.rate, profile.portfolio];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", niche: "", bio: "", rate: null, portfolio: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d: { user: UserProfile }) => { setProfile(d.user); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, niche: profile.niche, bio: profile.bio, rate: profile.rate, portfolio: profile.portfolio, avatarUrl: profile.avatarUrl }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = (await res.json()) as { error?: string }; setError(d.error ?? "Save failed"); }
    setSaving(false);
  }

  const completion = completionScore(profile);

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profile Setup</h1>
        <p className="text-muted-foreground mt-1">Complete your profile to get more personalized AI proposals.</p>
      </div>

      {/* Completion meter */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-foreground font-medium">Profile Completion</span>
          <span className={`text-sm font-bold ${completion === 100 ? "text-accent" : "text-primary-light"}`}>{completion}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-hero rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
        {completion < 100 && (
          <p className="text-muted-foreground text-xs mt-2">A complete profile improves AI proposal quality by up to 40%.</p>
        )}
        {completion === 100 && (
          <div className="flex items-center gap-2 mt-2 text-accent text-sm">
            <CheckCircle className="w-4 h-4" /> Profile complete — AI will use all your info!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar + Name */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="text-foreground font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary-light" /> Basic Info</h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {profile.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1">
              <label htmlFor="avatar-url" className="block text-xs text-muted-foreground mb-1">Avatar URL (optional)</label>
              <input
                id="avatar-url"
                type="url"
                value={profile.avatarUrl ?? ""}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input id="profile-name" type="text" required value={profile.name ?? ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={profile.email} disabled
                className="w-full px-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-muted-foreground cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium text-foreground mb-1.5">Professional Bio</label>
            <textarea id="profile-bio" rows={3} maxLength={500} value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Briefly describe what you do and who you help..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" />
            <p className="text-xs text-muted-foreground mt-1">{(profile.bio ?? "").length}/500</p>
          </div>
        </div>

        {/* Freelance Details */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-5">
          <h2 className="text-foreground font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4 text-accent" /> Freelance Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-rate" className="block text-sm font-medium text-foreground mb-1.5">
                <DollarSign className="w-3.5 h-3.5 inline" /> Hourly Rate (USD)
              </label>
              <input id="profile-rate" type="number" min={0} max={10000} step={5} value={profile.rate ?? ""}
                onChange={(e) => setProfile({ ...profile, rate: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g. 75"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label htmlFor="profile-portfolio" className="block text-sm font-medium text-foreground mb-1.5">
                <Globe className="w-3.5 h-3.5 inline" /> Portfolio URL
              </label>
              <input id="profile-portfolio" type="url" value={profile.portfolio ?? ""} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                placeholder="https://yourportfolio.com"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
            </div>
          </div>
        </div>

        {/* Niche */}
        <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-foreground font-semibold">Your Niche</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" role="radiogroup" aria-label="Select your niche">
            {NICHES.map((n) => {
              const selected = profile.niche === n.id;
              return (
                <button key={n.id} type="button" role="radio" aria-checked={selected}
                  onClick={() => setProfile({ ...profile, niche: n.id })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all text-xs ${selected ? "bg-primary/15 border-primary/50 text-primary-light" : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
                  <span className="text-xl">{n.icon}</span>
                  <span className="font-medium leading-tight">{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all shadow-glow-primary disabled:opacity-60">
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}
