import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, Zap, DollarSign, Mail, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "Free Freelance Tools — Rate Calculator, Subject Line Generator & Red Flag Detector | iCloseLeads",
  description: "Free tools built for freelancers: hourly rate calculator, cold email subject line generator, and red flag detector to spot bad clients. No signup required.",
  keywords: ["free freelance tools","freelance rate calculator","cold email subject line generator freelance","freelance red flag detector","how to calculate freelance hourly rate","free tools for freelancers 2025","freelance pricing calculator","best subject lines for cold emails freelancers","spot bad clients freelance","free resources for freelancers"],
  openGraph: { title: "Free Freelance Tools | iCloseLeads", description: "Rate calculator, subject line generator, red flag detector — free tools every freelancer needs.", url: "https://icloseleads.com/features/free-tools", type: "website" },
  alternates: { canonical: "https://icloseleads.com/features/free-tools" },
};

const TOOLS = [
  {icon:<DollarSign className="w-6 h-6 text-accent"/>,color:"#00E5A0",name:"Freelance Rate Calculator",desc:"Stop undercharging. Enter your target income, expenses, and billable hours — get your exact hourly and project rates.",features:["Hourly rate calculation","Project rate estimation","Tax & expense adjustment","Market rate comparison"]},
  {icon:<Mail className="w-6 h-6 text-gold"/>,color:"#FFD166",name:"Subject Line Generator",desc:"The subject line determines opens or deletes. Get 5 high-converting variants for your specific niche and job type.",features:["5 variants per request","Niche-aware suggestions","Open-rate optimised","A/B testing guidance"]},
  {icon:<AlertTriangle className="w-6 h-6 text-destructive"/>,color:"#EF4444",name:"Red Flag Detector",desc:"Paste a job description and our AI scans for bad client signals — unrealistic budgets, scope creep, payment risk.",features:["Budget red flag detection","Scope creep signals","Payment risk assessment","Exploitation pattern matching"]},
];

export default function FreeToolsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-gold/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6"><Wrench className="w-4 h-4" /> Free Tools</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">3 Free Tools Every<br /><span className="bg-clip-text text-transparent" style={{backgroundImage:"linear-gradient(135deg,#00E5A0 0%,#FFD166 100%)"}}>Freelancer Actually Needs</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Rate calculator, subject line generator, and red flag detector — built into iCloseLeads and free for everyone.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Access All Tools Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {TOOLS.map(tool=>(
            <div key={tool.name} className="flex flex-col lg:flex-row gap-8 p-8 rounded-3xl border bg-surface transition-all" style={{borderColor:`${tool.color}25`}}>
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{background:`${tool.color}15`}}>{tool.icon}</div>
                <h2 className="text-2xl font-extrabold text-foreground mb-3">{tool.name}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{tool.desc}</p>
                <ul className="space-y-2">{tool.features.map(f=><li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{color:tool.color}}/>{f}</li>)}</ul>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Link href="/auth?mode=signup" className="w-full max-w-xs block text-center py-3 px-6 rounded-2xl font-semibold text-sm transition-all" style={{background:`${tool.color}15`,color:tool.color,border:`1px solid ${tool.color}30`}}>Try {tool.name} Free →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-24 px-4 border-t border-border/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Tools that pay for themselves</h2>
          <p className="text-muted-foreground text-lg mb-8">One rate calculation that stops you undercharging. One red flag caught before signing a bad contract. Free.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Access All Free Tools <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">{[{label:"Lead Discovery",href:"/features/lead-discovery"},{label:"AI Proposals",href:"/features/ai-proposals"},{label:"CRM Pipeline",href:"/features/crm-pipeline"},{label:"Email Outreach",href:"/features/email-outreach"},{label:"Analytics",href:"/features/analytics"}].map(({label,href})=><Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">{label} →</Link>)}</div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
