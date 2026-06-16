import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Zap, CheckCircle2, ArrowRight, Bell, FileDown, StickyNote, BarChart2, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Freelance CRM Software — Track Every Client Deal in a 6-Stage Pipeline | iCloseLeads",
  description: "The built-in CRM for freelancers. Move leads through 6 stages from New to Won. Never lose track of a deal again. Free forever, no spreadsheets needed.",
  keywords: ["freelance CRM software","client pipeline management for freelancers","best CRM for freelancers","freelance deal tracker","track freelance leads and clients","simple CRM for freelancers 2025","freelance sales pipeline","client management software freelancer","free CRM for independent contractors","freelance project pipeline tool"],
  openGraph: { title: "Freelance CRM & Pipeline | iCloseLeads", description: "6-stage pipeline built for freelancers. New → Contacted → Replied → Follow-Up → Won → Lost.", url: "https://icloseleads.com/features/crm-pipeline", type: "website" },
  alternates: { canonical: "https://icloseleads.com/features/crm-pipeline" },
};

const STAGES = [
  {name:"New",color:"#60A5FA",desc:"Saved, not contacted yet."},
  {name:"Contacted",color:"#9F67FF",desc:"Proposal sent."},
  {name:"Replied",color:"#FFD166",desc:"Conversation active."},
  {name:"Follow-Up",color:"#FB923C",desc:"Needs a nudge."},
  {name:"Won",color:"#00E5A0",desc:"Deal closed."},
  {name:"Lost",color:"#EF4444",desc:"Archived."},
];
const BENEFITS = [
  {icon:<Layers className="w-5 h-5 text-primary-light"/>,title:"6-Stage Visual Pipeline",desc:"See every deal at a glance. Move leads between stages with one click."},
  {icon:<Bell className="w-5 h-5 text-gold"/>,title:"Follow-Up Reminders",desc:"iCloseLeads tells you when to follow up. Never go silent at the wrong moment."},
  {icon:<StickyNote className="w-5 h-5 text-accent"/>,title:"Private Lead Notes",desc:"Add context about the company or contact — available wherever you are."},
  {icon:<FileDown className="w-5 h-5 text-blue-400"/>,title:"CSV Export",desc:"Export your full pipeline anytime. Excel-ready with UTF-8 BOM."},
  {icon:<BarChart2 className="w-5 h-5 text-purple-400"/>,title:"Pipeline Analytics",desc:"Win rate, average time-to-close, best sources — calculated automatically."},
  {icon:<TrendingUp className="w-5 h-5 text-pink-400"/>,title:"Source Tracking",desc:"Know which sources actually convert for your niche."},
];

export default function CRMPipelinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-primary/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6"><Layers className="w-4 h-4" /> CRM Pipeline</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">The Freelance CRM That<br /><span className="bg-clip-text text-transparent" style={{backgroundImage:"linear-gradient(135deg,#60A5FA 0%,#9F67FF 100%)"}}>Closes Deals, Not Spreadsheets</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Track every lead from first contact to closed deal — with reminders, notes, and analytics included free.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Start Tracking Leads Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-12 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-6">Your 6-stage pipeline</p>
          <div className="flex flex-col sm:flex-row gap-2">{STAGES.map(s=><div key={s.name} className="flex-1 p-4 rounded-xl border border-border bg-background text-center"><div className="w-3 h-3 rounded-full mx-auto mb-2" style={{background:s.color}}/><p className="font-bold text-foreground text-sm mb-1">{s.name}</p><p className="text-muted-foreground text-xs">{s.desc}</p></div>)}</div>
        </div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Everything a freelancer needs to close more deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{BENEFITS.map(b=><div key={b.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-blue-500/30 transition-all"><div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">{b.icon}</div><h3 className="font-bold text-foreground mb-2">{b.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p></div>)}</div>
        </div>
      </section>
      <section className="py-24 px-4 border-t border-border/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Stop losing deals in a spreadsheet</h2>
          <p className="text-muted-foreground text-lg mb-8">iCloseLeads CRM is free forever. Pipeline ready the moment you save your first lead.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Open Your Free Pipeline <ArrowRight className="w-4 h-4" /></Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">{["No credit card","6-stage pipeline","Unlimited leads"].map(t=><span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent"/>{t}</span>)}</div>
        </div>
      </section>
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">{[{label:"Lead Discovery",href:"/features/lead-discovery"},{label:"AI Proposals",href:"/features/ai-proposals"},{label:"Email Outreach",href:"/features/email-outreach"},{label:"Analytics",href:"/features/analytics"},{label:"Free Tools",href:"/features/free-tools"}].map(({label,href})=><Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">{label} →</Link>)}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
