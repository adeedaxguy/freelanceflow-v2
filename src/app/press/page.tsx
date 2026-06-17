import type { Metadata } from "next";
import { Download, ExternalLink, Mail, FileText, Image, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press & Media — iCloseLeads",
  description: "iCloseLeads press kit, media resources, brand assets, and press contact information for journalists and media professionals.",
};

const coverage = [
  {
    outlet: "TechCrunch",
    date: "March 2025",
    title: "iCloseLeads raises $2.1M to help freelancers ditch Upwork and Fiverr",
    url: "#",
    logo: "TC",
  },
  {
    outlet: "Product Hunt",
    date: "February 2025",
    title: "#1 Product of the Day — iCloseLeads: AI lead gen for freelancers",
    url: "#",
    logo: "PH",
  },
  {
    outlet: "IndieHackers",
    date: "January 2025",
    title: "How iCloseLeads hit $25k MRR in 90 days with no paid ads",
    url: "#",
    logo: "IH",
  },
  {
    outlet: "The Freelancer's Union Blog",
    date: "December 2024",
    title: "The tools that helped our members find 3x more clients",
    url: "#",
    logo: "FU",
  },
];

const stats = [
  { value: "50,000+", label: "Registered Freelancers" },
  { value: "$2.1M", label: "Seed Funding Raised" },
  { value: "Multi", label: "Lead Channels" },
  { value: "4.8/5", label: "Average User Rating" },
];

export default function PressPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-20" />
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <h1 className="text-5xl font-extrabold text-foreground mb-6">
              Press &amp; <span className="gradient-text">Media</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
              Resources, brand assets, and press contacts for journalists and media professionals covering iCloseLeads.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-surface border-y border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold gradient-text mb-1">{value}</p>
                  <p className="text-muted-foreground text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">About iCloseLeads</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>iCloseLeads is an AI-powered client acquisition platform that helps freelancers find, contact, and win clients — without relying on crowded marketplaces like Upwork or Fiverr.</p>
                <p>Founded in 2024, iCloseLeads combines live hiring signals, local business opportunities, contact enrichment, and AI-assisted proposal writing — all from a single dashboard built for freelancers.</p>
                <p>The company is headquartered remotely and has raised $2.1M in seed funding to accelerate product development and community growth.</p>
              </div>
            </div>

            {/* Coverage */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Recent Coverage</h2>
              <div className="space-y-4">
                {coverage.map((item) => (
                  <a key={item.title} href={item.url} className="block p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-xs text-muted-foreground flex-shrink-0">
                        {item.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary-light">{item.outlet}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <h3 className="text-foreground font-medium text-sm group-hover:text-primary-light transition-colors line-clamp-2">{item.title}</h3>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Brand Assets */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Brand Assets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Image, title: "Logo Pack", desc: "SVG, PNG (light & dark)", href: "#" },
                  { icon: Palette, title: "Brand Guidelines", desc: "Colors, typography, usage", href: "#" },
                  { icon: FileText, title: "Press Kit PDF", desc: "Full press kit & fact sheet", href: "#" },
                ].map(({ icon: Icon, title, desc, href }) => (
                  <a key={title} href={href} className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 text-center transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-primary-light" />
                    </div>
                    <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                    <p className="text-xs text-muted-foreground mb-3">{desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-primary-light font-medium">
                      <Download className="w-3 h-3" /> Download
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Press Contact */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-light" /> Press Contact
              </h3>
              <p className="text-muted-foreground text-sm mb-4">For press inquiries, interview requests, or media partnerships:</p>
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">Jordan Miles</p>
                <p className="text-muted-foreground">Head of Communications</p>
                <Link href="mailto:press@icloseleads.com" className="text-primary-light hover:underline block">
                  press@icloseleads.com
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Response time: within 24 hours on business days.</p>
              </div>
            </div>

            {/* Boilerplate */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
              <h3 className="font-bold text-foreground mb-3">Approved Boilerplate</h3>
              <p className="text-muted-foreground text-xs leading-relaxed italic">
                &quot;iCloseLeads is an AI-powered client acquisition platform that helps freelancers find and win clients without relying on crowded marketplaces. The platform combines live lead discovery, local business opportunities, CRM tracking, and AI-assisted outreach — all in one dashboard.&quot;
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
