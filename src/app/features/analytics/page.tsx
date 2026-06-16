import type { Metadata } from "next";
import Link from "next/link";
import { BarChart2, Zap, TrendingUp, PieChart, Target, CheckCircle2, ArrowRight, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Freelance Analytics Dashboard — Track Leads, Proposals & Revenue | iCloseLeads",
  description: "See exactly what\'s working in your freelance business. Track open rates, reply rates, win rates, pipeline conversion, and revenue — all in one dashboard.",
  keywords: ["freelance analytics dashboard","track freelance outreach performance","freelance business analytics tool","proposal conversion tracking freelancers","freelance revenue tracking","cold email analytics freelancers","freelance KPI dashboard","best analytics tool for freelancers 2025","track leads and proposals freelance","freelance pipeline conversion rate"],
  openGraph: { title: "Freelance Analytics Dashboard | iCloseLeads", description: "Open rates, reply rates, win rates, revenue — all tracked automatically.", url: "https://icloseleads.com/features/analytics", type: "website" },
  alternates: { canonical: "https://icloseleads.com/features/analytics" },
};

const METRICS = [
  {name:"Email open rate",value:"94%",sub:"vs 21% industry avg",color:"#00E5A0"},
  {name:"Average reply rate",value:"14%",sub:"for well-targeted leads",color:"#9F67FF"},
  {name:"Pipeline win rate",value:"22%",sub:"across all accounts",color:"#FFD166"},
  {name:"Time to first reply",value:"47min",sub:"from first send",color:"#60A5FA"},
];
const BENEFITS = [
  {icon:<Activity className="w-5 h-5 text-accent"/>,title:"Real-Time Dashboard",desc:"Leads found, proposals sent, emails opened, replies received — updating live as you work."},
  {icon:<PieChart className="w-5 h-5 text-primary-light"/>,title:"Source Breakdown",desc:"See which of the 11 job sources actually converts for your niche."},
  {icon:<TrendingUp className="w-5 h-5 text-gold"/>,title:"30-Day Email Trends",desc:"Opens, clicks, replies over 30 days. Spot patterns: best send days, campaign performance."},
  {icon:<Target className="w-5 h-5 text-blue-400"/>,title:"Pipeline Reports",desc:"Win rate, time-to-close, deals by stage, revenue won per month."},
  {icon:<BarChart2 className="w-5 h-5 text-purple-400"/>,title:"Niche Performance",desc:"Which niche gets you the most replies? Analytics shows you where to focus."},
  {icon:<CheckCircle2 className="w-5 h-5 text-accent"/>,title:"Weekly Usage Stats",desc:"Track your plan quota: leads searched, proposals generated, and outreach prepared."},
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-transparent to-purple-500/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6"><BarChart2 className="w-4 h-4" /> Analytics</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">Know Exactly What&apos;s Working<br /><span className="bg-clip-text text-transparent" style={{backgroundImage:"linear-gradient(135deg,#34D399 0%,#9F67FF 100%)"}}>In Your Freelance Business</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Stop guessing. iCloseLeads tracks every open, click, reply, and deal close — then shows you exactly where your time is best spent.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> View Your Dashboard Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-12 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">{METRICS.map(({name,value,sub,color})=><div key={name} className="text-center p-5 rounded-2xl border border-border bg-background"><div className="text-3xl font-extrabold mb-1" style={{color}}>{value}</div><div className="text-foreground text-sm font-semibold mb-0.5">{name}</div><div className="text-muted-foreground text-xs">{sub}</div></div>)}</div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Every metric that matters for freelance growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{BENEFITS.map(b=><div key={b.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-green-500/30 transition-all"><div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">{b.icon}</div><h3 className="font-bold text-foreground mb-2">{b.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p></div>)}</div>
        </div>
      </section>
      <section className="py-24 px-4 border-t border-border/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Data-driven freelancing starts here</h2>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Open Your Dashboard Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">{[{label:"Lead Discovery",href:"/features/lead-discovery"},{label:"AI Proposals",href:"/features/ai-proposals"},{label:"CRM Pipeline",href:"/features/crm-pipeline"},{label:"Email Outreach",href:"/features/email-outreach"},{label:"Free Tools",href:"/features/free-tools"}].map(({label,href})=><Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">{label} →</Link>)}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
