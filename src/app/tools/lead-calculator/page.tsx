"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Zap, TrendingUp, DollarSign, Target, RefreshCw } from "lucide-react";

function Slider({ label, min, max, step, value, onChange, format }: {
  label: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary" />
      <div className="flex justify-between text-xs text-muted-foreground/60">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color = "text-foreground" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-card border border-border text-center">
      <div className={`text-3xl font-extrabold mb-1 ${color}`}>{value}</div>
      <div className="text-sm font-semibold text-foreground mb-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function LeadCalculatorPage() {
  const [leadsPerWeek,   setLeadsPerWeek]   = useState(50);
  const [closeRate,      setCloseRate]      = useState(5);
  const [avgProjectSize, setAvgProjectSize] = useState(2500);
  const [hoursPerLead,   setHoursPerLead]   = useState(3);
  const [hourlyRate,     setHourlyRate]     = useState(75);

  const calc = useMemo(() => {
    const closedPerWeek   = leadsPerWeek * (closeRate / 100);
    const revenuePerWeek  = closedPerWeek * avgProjectSize;
    const revenuePerMonth = revenuePerWeek * 4.33;
    const revenuePerYear  = revenuePerMonth * 12;
    const timePerWeekHrs  = leadsPerWeek * hoursPerLead;
    const timeCostPerWeek = timePerWeekHrs * hourlyRate;
    const roi             = revenuePerWeek > 0 ? ((revenuePerWeek - timeCostPerWeek) / timeCostPerWeek) * 100 : 0;
    const leadsNeededFor10k = avgProjectSize > 0 ? Math.ceil(10000 / avgProjectSize / (closeRate / 100)) : 0;
    return { closedPerWeek, revenuePerWeek, revenuePerMonth, revenuePerYear, timePerWeekHrs, timeCostPerWeek, roi, leadsNeededFor10k };
  }, [leadsPerWeek, closeRate, avgProjectSize, hoursPerLead, hourlyRate]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtPct = (n: number) => `${n.toFixed(1)}%`;
  const fmtNum = (n: number) => n.toFixed(1);

  return (
    <>
      <Navbar />
      <main className="pt-[108px]">
        {/* Hero */}
        <section className="py-16 px-4 text-center bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-5">
              Free Tool
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Freelance Lead Value &amp; ROI Calculator
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Find out exactly how much your leads are worth, how many you need to hit your income goal,
              and what it's costing you to find them manually.
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Inputs */}
            <div className="bg-surface border border-border rounded-2xl p-8 space-y-8 sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">Your Numbers</h2>
                <button onClick={() => { setLeadsPerWeek(50); setCloseRate(5); setAvgProjectSize(2500); setHoursPerLead(3); setHourlyRate(75); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              <Slider label="Leads contacted per week" min={5} max={200} step={5}
                value={leadsPerWeek} onChange={setLeadsPerWeek} format={v => `${v} leads`} />
              <Slider label="Close rate" min={1} max={30} step={0.5}
                value={closeRate} onChange={setCloseRate} format={fmtPct} />
              <Slider label="Average project value" min={500} max={20000} step={500}
                value={avgProjectSize} onChange={setAvgProjectSize} format={fmt} />
              <Slider label="Hours spent finding each lead" min={0.5} max={10} step={0.5}
                value={hoursPerLead} onChange={setHoursPerLead} format={v => `${v}h`} />
              <Slider label="Your hourly rate" min={25} max={300} step={25}
                value={hourlyRate} onChange={setHourlyRate} format={v => `${fmt(v)}/hr`} />
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">Your Results</h2>

              <div className="grid grid-cols-2 gap-4">
                <Stat label="Revenue / week" value={fmt(calc.revenuePerWeek)} color="text-accent" />
                <Stat label="Revenue / month" value={fmt(calc.revenuePerMonth)} color="text-accent" />
                <Stat label="Revenue / year" value={fmt(calc.revenuePerYear)} sub="at current close rate" color="text-primary-light" />
                <Stat label="Clients closed / week" value={fmtNum(calc.closedPerWeek)} sub={`from ${leadsPerWeek} leads`} />
              </div>

              {/* Time cost insight */}
              <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm mb-1">Manual prospecting cost</div>
                    <div className="text-destructive text-2xl font-extrabold">{fmt(calc.timeCostPerWeek)}<span className="text-sm font-normal text-muted-foreground">/week</span></div>
                    <p className="text-muted-foreground text-xs mt-1">
                      You spend ~{calc.timePerWeekHrs}h/week finding leads. At {fmt(hourlyRate)}/hr that's {fmt(calc.timeCostPerWeek)}/week in opportunity cost.
                    </p>
                  </div>
                </div>
              </div>

              {/* ROI */}
              <div className={`p-5 rounded-2xl border ${calc.roi >= 0 ? "bg-accent/5 border-accent/20" : "bg-destructive/5 border-destructive/20"}`}>
                <div className="flex items-start gap-3">
                  <TrendingUp className={`w-5 h-5 flex-shrink-0 mt-0.5 ${calc.roi >= 0 ? "text-accent" : "text-destructive"}`} />
                  <div>
                    <div className="font-semibold text-foreground text-sm mb-1">Lead generation ROI</div>
                    <div className={`text-2xl font-extrabold ${calc.roi >= 0 ? "text-accent" : "text-destructive"}`}>
                      {calc.roi >= 0 ? "+" : ""}{calc.roi.toFixed(0)}%
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      Net return after accounting for time spent finding leads.
                    </p>
                  </div>
                </div>
              </div>

              {/* Goal insight */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary-light flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm mb-1">To earn $10,000/month</div>
                    <div className="text-primary-light text-2xl font-extrabold">{calc.leadsNeededFor10k} leads/month</div>
                    <p className="text-muted-foreground text-xs mt-1">
                      At your {fmtPct(closeRate)} close rate and {fmt(avgProjectSize)} average project.
                      That's ~{Math.ceil(calc.leadsNeededFor10k / 4)} leads/week.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center">
                <p className="text-foreground font-semibold mb-2">iCloseLeads finds your leads for free</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Stop spending {fmt(calc.timeCostPerWeek)}/week on manual prospecting.
                  iCloseLeads finds, scores, and surfaces leads from 23 live sources automatically.
                </p>
                <Link href="/auth?mode=signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition-all shadow-glow-primary">
                  <Zap className="w-4 h-4" />
                  Start Finding Leads Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEO content */}
        <section className="py-16 px-4 border-t border-border">
          <div className="max-w-3xl mx-auto blog-content">
            <h2>How to Use This Freelance Lead Value Calculator</h2>
            <p>This free tool helps freelancers, agencies, and consultants understand the real economics of their lead generation. Adjust the sliders to match your current numbers and see instantly how much each lead is worth — and how much time you're wasting finding them manually.</p>
            <h3>What is a lead worth to a freelancer?</h3>
            <p>A lead's value depends on your close rate and average project size. A freelancer with a 5% close rate and $2,500 average project has leads worth $125 each. At 50 leads a week, that's $6,250 in potential weekly revenue. The question is: how much does it cost you to find those 50 leads?</p>
            <h3>How to improve your close rate</h3>
            <p>The single biggest lever is lead quality. Cold leads with low relevance to your services will close at 1–2%. Warm, targeted leads — people actively posting for your exact skillset — close at 10–20%. Tools like <a href="https://icloseleads.com/dashboard/leads">iCloseLeads lead discovery</a> focus exclusively on high-intent leads so your time goes into closing, not sifting.</p>
            <p>Want to start finding better leads? <a href="https://icloseleads.com/auth?mode=signup">Try iCloseLeads free</a> — no credit card, no time limit during Early Access.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
