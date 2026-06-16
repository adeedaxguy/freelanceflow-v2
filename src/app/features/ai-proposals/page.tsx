import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, Clock, MessageSquare, Edit3, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://icloseleads.com"),
  title: "AI Proposal Generator for Freelancers — Write Winning Cold Emails in 3 Seconds | iCloseLeads",
  description: "Generate personalised freelance proposals and cold emails in 3 seconds using Groq's Llama 3.3 AI. Tailored to each job posting. Used by 2,800+ freelancers.",
  keywords: ["AI proposal generator for freelancers","automated proposal writing freelance","cold email generator freelancers","AI cover letter freelance jobs","personalized proposal writing AI","freelance pitch generator","best AI tool for freelance proposals 2025","automated cold email outreach freelancers","freelance proposal template generator","how to write freelance proposals faster"],
  openGraph: { title: "AI Proposal Generator for Freelancers | iCloseLeads", description: "Stop staring at blank screens. iCloseLeads writes a personalised cold email for every lead in 3 seconds.", url: "https://icloseleads.com/features/ai-proposals", type: "website" },
  alternates: { canonical: "https://icloseleads.com/features/ai-proposals" },
};

const BENEFITS = [
  { icon: <Clock className="w-5 h-5 text-gold" />, title: "3-Second Generation", desc: "Powered by Groq ultra-fast inference. Click generate — your personalised proposal is ready before you finish blinking." },
  { icon: <MessageSquare className="w-5 h-5 text-primary-light" />, title: "Reads the Actual Job Posting", desc: "The AI parses the real job description — company name, tech stack, requirements — and weaves it into the email." },
  { icon: <Edit3 className="w-5 h-5 text-accent" />, title: "Sounds Like You, Not ChatGPT", desc: "Groq\'s Llama 3.3 writes in natural, conversational tone that passes the \'did a human write this?\' test every time." },
  { icon: <Sparkles className="w-5 h-5 text-primary-light" />, title: "Follow-Up Sequences", desc: "Generate warm, non-pushy follow-up emails after your initial proposal — the emails people actually reply to." },
];
const FAQS = [
  { q: "What AI model powers the proposal generator?", a: "iCloseLeads uses Groq\'s llama-3.3-70b-versatile — one of the fastest large language models. Proposals generate in under 3 seconds." },
  { q: "Are the proposals actually personalised?", a: "Genuinely. The AI reads the specific job posting — company name, requirements, description — and writes a cold email referencing those details. Two different job postings produce two completely different emails." },
  { q: "What\'s the typical response rate?", a: "Users report 3–5× higher response rates vs generic templates. The 94% open rate comes from AI-optimised subject lines." },
];

export default function AIProposalsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-primary/8 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6"><Sparkles className="w-4 h-4" /> AI Proposal Engine</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">Write Winning Freelance Proposals<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg,#FFD166 0%,#9F67FF 100%)" }}>in 3 Seconds with AI</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">Stop spending 20 minutes on every proposal. iCloseLeads reads the job posting and writes a personalised cold email that sounds like you — in under 3 seconds.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?mode=signup" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Generate Your First Proposal Free <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>
      <section className="py-8 px-4 border-y border-border/60 bg-surface/40">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[{n:"94%",l:"Open rate"},{n:"3s",l:"Generation time"},{n:"3–5×",l:"Higher reply rate"},{n:"2,800+",l:"Freelancers using iCloseLeads"}].map(({n,l})=><div key={l}><div className="text-3xl font-extrabold text-gold mb-0.5">{n}</div><div className="text-muted-foreground text-xs">{l}</div></div>)}
        </div>
      </section>
      <section className="py-24 px-4 bg-surface/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-12">Everything your proposal needs to convert</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BENEFITS.map(b=><div key={b.title} className="p-6 rounded-2xl bg-background border border-border hover:border-gold/30 transition-all"><div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">{b.icon}</div><h3 className="font-bold text-foreground mb-2">{b.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p></div>)}
          </div>
        </div>
      </section>
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-foreground text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-5">{FAQS.map(({q,a})=><div key={q} className="border border-border rounded-2xl p-6"><h3 className="font-bold text-foreground mb-2">{q}</h3><p className="text-muted-foreground text-sm leading-relaxed">{a}</p></div>)}</div>
        </div>
      </section>
      <section className="py-24 px-4 border-t border-border/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">Your next proposal is 3 seconds away</h2>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg"><Zap className="w-5 h-5" /> Try It Free <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <section className="py-12 px-4 border-t border-border/60 bg-surface/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium">Explore more iCloseLeads features</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[{label:"Lead Discovery",href:"/features/lead-discovery"},{label:"CRM Pipeline",href:"/features/crm-pipeline"},{label:"Email Outreach",href:"/features/email-outreach"},{label:"Analytics",href:"/features/analytics"},{label:"Free Tools",href:"/features/free-tools"}].map(({label,href})=><Link key={href} href={href} className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary-light hover:border-primary/40 text-sm transition-all">{label} →</Link>)}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
