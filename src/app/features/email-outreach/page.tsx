import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Zap, Send, BarChart2, Shield, CheckCircle2, ArrowRight, Eye, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Cold Email Outreach for Freelancers — Prepare, Track & Follow Up | iCloseLeads",
  description: "Prepare personalised cold emails in Gmail, track outreach history, and manage follow-ups. Safe free-plan outreach for freelancers.",
  keywords: ["cold email outreach for freelancers","freelance email campaign tool","automated cold email freelancers","email tracking for freelancers","freelance outreach software","cold email software for independent contractors","how to do cold outreach as a freelancer","email campaign builder freelancers","best cold email tool freelancers 2025","send cold emails from your own account"],
  openGraph: { title: "Cold Email Outreach for Freelancers | iCloseLeads", description: "Write, prepare, and track cold outreach with safe Gmail compose workflows.", url: "https://icloseleads.com/features/email-outreach", type: "website" },
  alternates: { canonical: "https://icloseleads.com/features/email-outreach" },
};

const BENEFITS = [
  {icon:<Send className="w-5 h-5 text-pink-400"/>,title:"Prepare in Gmail",desc:"Generate a proposal, open Gmail compose prefilled, review it, and send manually from your own inbox."},
  {icon:<Eye className="w-5 h-5 text-primary-light"/>,title:"Outreach Tracking",desc:"Track prepared and sent emails so you always know who you already contacted."},
  {icon:<Clock className="w-5 h-5 text-gold"/>,title:"Campaign Builder",desc:"Organise multi-step outreach sequences: initial message, 3-day follow-up, and 7-day nudge."},
  {icon:<Shield className="w-5 h-5 text-accent"/>,title:"Safety Limits",desc:"Free-plan limits are built in: 400 prepared emails/month, 50/day, and 5/minute."},
  {icon:<BarChart2 className="w-5 h-5 text-blue-400"/>,title:"Outreach History Log",desc:"Every prepared or sent email is logged with timestamp, status, and body."},
  {icon:<CheckCircle2 className="w-5 h-5 text-accent"/>,title:"Duplicate Prevention",desc:"Automatically prevents emailing the same company twice. Protect your reputation."},
];

export default function EmailOutreachPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/8 via-transparent to-blue-500/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-semibold mb-6"><Mail className="w-4 h-4" /> Email Outreach</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">Cold Email Outreach Built<br /><span className="bg-clip-text text-transparent" style={{backgroundImage:"linear-gradient(135deg,#F472B6 0%,#60A5FA 100%)"}}>for Safe Gmail Sending</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Write, prepare, and track cold emails with Gmail compose. You stay in control and send from your own inbox.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Start Outreach Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-24 px-4 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Everything you need for effective cold outreach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{BENEFITS.map(b=><div key={b.title} className="p-6 rounded-2xl bg-background border border-border hover:border-pink-500/30 transition-all"><div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">{b.icon}</div><h3 className="font-bold text-foreground mb-2">{b.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p></div>)}</div>
        </div>
      </section>
      <section className="py-24 px-4 border-t border-border/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Prepare your first cold email in 60 seconds</h2>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Get Started Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">{[{label:"Lead Discovery",href:"/features/lead-discovery"},{label:"AI Proposals",href:"/features/ai-proposals"},{label:"CRM Pipeline",href:"/features/crm-pipeline"},{label:"Analytics",href:"/features/analytics"},{label:"Free Tools",href:"/features/free-tools"}].map(({label,href})=><Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">{label} →</Link>)}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
