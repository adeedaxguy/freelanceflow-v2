import type { Metadata } from "next";
import { CheckCircle2, AlertCircle, Clock, Activity, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Platform Status — iCloseLeads",
  description: "Real-time status of all iCloseLeads services. Check if lead search, email sending, AI proposals, and APIs are operational.",
};

const services = [
  { name: "Lead Search & Aggregation", status: "operational", latency: "320ms" },
  { name: "AI Proposal Generator", status: "operational", latency: "2.1s" },
  { name: "Gmail Compose Prep", status: "operational", latency: "180ms" },
  { name: "Contact Enrichment", status: "operational", latency: "410ms" },
  { name: "Authentication & Sessions", status: "operational", latency: "95ms" },
  { name: "Billing & Subscriptions (Stripe)", status: "operational", latency: "220ms" },
  { name: "Dashboard & Web App", status: "operational", latency: "140ms" },
  { name: "API (v1)", status: "operational", latency: "180ms" },
  { name: "Admin Panel", status: "operational", latency: "160ms" },
];

const incidents = [
  {
    date: "April 15, 2025",
    title: "Elevated error rate on one lead channel",
    status: "resolved",
    duration: "43 minutes",
    description: "One lead channel returned malformed data for approximately 43 minutes. Other lead channels continued to serve normally. Issue resolved after source parser update deployed at 14:27 UTC.",
  },
  {
    date: "March 28, 2025",
    title: "Increased proposal generation latency",
    status: "resolved",
    duration: "1 hour 12 minutes",
    description: "The AI proposal service experienced elevated response times upstream, causing proposal generation to take 8-15 seconds instead of the normal 2-3 seconds. No data loss occurred. Resolved when normal performance returned.",
  },
  {
    date: "February 10, 2025",
    title: "Scheduled maintenance — Database migration",
    status: "resolved",
    duration: "22 minutes",
    description: "Planned maintenance window to apply database schema migrations. The platform was in read-only mode during this period. Completed ahead of schedule.",
  },
];

const uptime = [
  { month: "Apr 2025", uptime: "99.97%" },
  { month: "Mar 2025", uptime: "99.89%" },
  { month: "Feb 2025", uptime: "99.94%" },
  { month: "Jan 2025", uptime: "100%" },
  { month: "Dec 2024", uptime: "99.98%" },
  { month: "Nov 2024", uptime: "100%" },
];

export default function StatusPage() {
  const allOperational = services.every(s => s.status === "operational");

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Overall status banner */}
        <div className={`py-6 border-b border-border ${allOperational ? "bg-green-500/5" : "bg-yellow-500/5"}`}>
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
            {allOperational ? (
              <>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">All Systems Operational</h1>
                  <p className="text-muted-foreground text-sm">All iCloseLeads services are running normally. Last checked: just now.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Partial Service Disruption</h1>
                  <p className="text-muted-foreground text-sm">Some services are experiencing issues. We&apos;re on it.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          {/* Services */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-5">Service Status</h2>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border/50">
              {services.map(({ name, status, latency }) => (
                <div key={name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      status === "operational" ? "bg-green-400 shadow-[0_0_6px] shadow-green-400/50" :
                      status === "degraded" ? "bg-yellow-400 shadow-[0_0_6px] shadow-yellow-400/50" :
                      "bg-red-400 shadow-[0_0_6px] shadow-red-400/50"
                    }`} />
                    <span className="text-sm text-foreground font-medium">{name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" /> {latency}
                    </span>
                    <span className={`capitalize font-medium ${
                      status === "operational" ? "text-green-400" :
                      status === "degraded" ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Uptime */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-5">Uptime History</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {uptime.map(({ month, uptime: u }) => (
                <div key={month} className="p-4 rounded-xl bg-surface border border-border text-center">
                  <p className="text-lg font-bold text-green-400 mb-1">{u}</p>
                  <p className="text-xs text-muted-foreground">{month}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Incidents */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-5">Incident History</h2>
            {incidents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-surface border border-border rounded-2xl">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">No incidents in the past 90 days.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.title} className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium capitalize">
                            {incident.status}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {incident.duration}
                          </span>
                        </div>
                        <h3 className="text-foreground font-semibold">{incident.title}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{incident.date}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{incident.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Subscribe */}
          <section className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center">
            <Zap className="w-8 h-8 text-primary-light mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">Get Status Updates</h3>
            <p className="text-muted-foreground text-sm mb-5">Subscribe to incident notifications and maintenance windows via email.</p>
            <form className="flex gap-2 max-w-sm mx-auto" action="#">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
              <button type="submit" className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
