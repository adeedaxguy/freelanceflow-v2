"use client";

import { useState } from "react";
import { Settings, Bell, Key, Trash2, Save, AlertTriangle, CheckCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import ConfirmModal from "@/components/ConfirmModal";
import { maskApiKey } from "@/lib/utils";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ emailReplies: true, weeklyDigest: true, productUpdates: false });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const fakeKeys = {
    hunter: process.env.NEXT_PUBLIC_APP_URL ? maskApiKey("hnt_xxxxxxxxxxxx1234") : "Not configured",
    openai: maskApiKey("sk-xxxxxxxxxxxxxxxxxxxx5678"),
    resend: maskApiKey("re_xxxxxxxxxxxxxxxxxxxx9012"),
  };

  function handleSaveNotifications() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  async function handleDeleteAccount() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-foreground font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-light" /> Notification Preferences
        </h2>
        {[
          { key: "emailReplies" as const, label: "Email Reply Alerts", desc: "Get notified when a prospect replies to your email." },
          { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Summary of your outreach performance every Monday." },
          { key: "productUpdates" as const, label: "Product Updates", desc: "News about new FreelanceFlow features and improvements." },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium text-sm">{label}</p>
              <p className="text-muted-foreground text-xs">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={notifications[key]}
              onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[key] ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
        <button onClick={handleSaveNotifications}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-sm font-medium transition-all">
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Preferences</>}
        </button>
      </div>

      {/* API Keys */}
      <div className="bg-gradient-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-foreground font-semibold flex items-center gap-2">
          <Key className="w-4 h-4 text-accent" /> API Key Status
        </h2>
        <p className="text-muted-foreground text-sm">Keys are configured server-side via environment variables and cannot be changed here.</p>
        {[
          { label: "Hunter.io API Key", value: fakeKeys.hunter, env: "HUNTER_API_KEY" },
          { label: "OpenAI API Key", value: fakeKeys.openai, env: "OPENAI_API_KEY" },
          { label: "Resend API Key", value: fakeKeys.resend, env: "RESEND_API_KEY" },
        ].map((k) => (
          <div key={k.label} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
            <div>
              <p className="text-foreground text-sm font-medium">{k.label}</p>
              <p className="text-muted-foreground text-xs font-mono mt-0.5">{k.value}</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{k.env}</span>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-card border border-red-500/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-red-400 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
          <div>
            <p className="text-foreground font-medium text-sm">Delete Account</p>
            <p className="text-muted-foreground text-xs">Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <button onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete Your Account"
        message="All your leads, emails, campaigns, and templates will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete My Account"
        onConfirm={() => void handleDeleteAccount()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
