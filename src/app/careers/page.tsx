import type { Metadata } from "next";
import { Briefcase, MapPin, Clock, DollarSign, Zap, Heart, Users, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers at iCloseLeads — Join Our Team",
  description: "Help us build the future of freelance client acquisition. We're a remote-first team on a mission to help freelancers build sustainable businesses.",
};

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote (Anywhere)",
    salary: "$130k–$180k",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "AI/ML"],
    description: "Lead the development of our AI-powered lead generation engine and client acquisition features. You'll work across the entire stack, ship user-facing features, and help architect our next growth phase.",
  },
  {
    title: "Product Designer (UI/UX)",
    department: "Design",
    type: "Full-time",
    location: "Remote (Anywhere)",
    salary: "$100k–$140k",
    tags: ["Figma", "Design Systems", "User Research"],
    description: "Shape the experience of thousands of freelancers. You'll own the end-to-end design process — from user research and wireframes to polished, accessible UI components.",
  },
  {
    title: "Growth Marketing Manager",
    department: "Marketing",
    type: "Full-time",
    location: "Remote (US/EU)",
    salary: "$90k–$130k",
    tags: ["SEO", "Content", "Paid Acquisition", "Analytics"],
    description: "Drive user acquisition and retention for iCloseLeads. You'll own our content strategy, SEO, paid campaigns, and community channels.",
  },
  {
    title: "Customer Success Lead",
    department: "Support",
    type: "Full-time",
    location: "Remote (US preferred)",
    salary: "$75k–$100k",
    tags: ["SaaS", "Onboarding", "Customer Retention"],
    description: "Be the voice of our users. You'll help new customers get their first leads, manage our help center content, and work directly with the product team to close the feedback loop.",
  },
  {
    title: "AI/ML Engineer (Contract)",
    department: "Engineering",
    type: "Contract (6 months)",
    location: "Remote (Anywhere)",
    salary: "$120–$180/hr",
    tags: ["Python", "LLMs", "OpenAI API", "Fine-tuning"],
    description: "Improve our proposal generation model and email personalization engine. You'll experiment with prompt engineering, fine-tuning, and retrieval-augmented generation.",
  },
];

const perks = [
  { icon: Globe, title: "100% Remote", description: "Work from anywhere in the world. We have team members across 14 countries." },
  { icon: DollarSign, title: "Competitive Pay", description: "Top-of-market salaries plus meaningful equity. We share the upside." },
  { icon: Clock, title: "Async-First", description: "No mandatory meetings before noon. Deep work is protected." },
  { icon: Heart, title: "Great Benefits", description: "Full health/dental/vision, home office stipend, learning budget, and unlimited PTO." },
  { icon: Users, title: "Small Team, Big Impact", description: "You won't be a cog in a machine. Every person here shapes the product." },
  { icon: Zap, title: "Ship Fast", description: "We deploy daily. No bureaucracy, no waiting 6 months to launch something." },
];

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-20" />
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold uppercase tracking-wider mb-6">
              We&apos;re hiring
            </span>
            <h1 className="text-5xl font-extrabold text-foreground mb-6">
              Build the Future of <br />
              <span className="gradient-text">Freelance Business</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              We&apos;re a small, remote-first team on a mission to help freelancers escape platform dependency and build sustainable client pipelines. Join us.
            </p>
            <a href="#openings" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold transition-colors">
              View Open Roles <Briefcase className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Perks */}
        <section className="py-16 bg-surface">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Why Work at iCloseLeads?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map(({ icon: Icon, title, description }) => (
                <div key={title} className="p-6 rounded-2xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <h3 className="text-foreground font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Openings */}
        <section id="openings" className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-3">Open Positions</h2>
            <p className="text-muted-foreground mb-10">All roles are remote unless otherwise noted.</p>
            <div className="space-y-4">
              {openings.map((job) => (
                <div key={job.title} className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20">
                          {job.department}
                        </span>
                        <span className="text-xs text-muted-foreground">{job.type}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{job.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-background border border-border text-xs text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`mailto:careers@icloseleads.com?subject=Application: ${encodeURIComponent(job.title)}`}
                      className="flex-shrink-0 px-5 py-2 bg-primary/10 hover:bg-primary text-primary-light hover:text-white border border-primary/30 rounded-xl text-sm font-medium transition-all"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* General application */}
            <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Don&apos;t see your role?</h3>
              <p className="text-muted-foreground mb-4 text-sm">We&apos;re always looking for exceptional people. Send us your resume and tell us how you&apos;d contribute.</p>
              <Link href="mailto:careers@icloseleads.com?subject=General Application" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl font-medium text-sm transition-colors">
                Send General Application
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
