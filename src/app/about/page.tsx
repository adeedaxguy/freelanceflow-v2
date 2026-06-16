import type { Metadata } from "next";
import { Users, Target, Zap, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About iCloseLeads — Built for Freelancers Who Mean Business",
  description: "iCloseLeads is on a mission to help freelancers worldwide escape platform dependency and build sustainable client pipelines through AI-powered outreach.",
};

const team = [
  { name: "Alex Chen", role: "Co-founder & CEO", bg: "from-primary/30 to-accent/20", initials: "AC", bio: "Former freelance developer who built tools for himself, then decided to share them." },
  { name: "Priya Sharma", role: "Co-founder & CTO", bg: "from-accent/30 to-primary/20", initials: "PS", bio: "ML engineer with a passion for automating the boring parts of running a business." },
  { name: "Jordan Miles", role: "Head of Design", bg: "from-gold/30 to-primary/20", initials: "JM", bio: "UX designer who believes every tool should be beautiful and intuitive." },
];

const values = [
  { icon: Target, title: "Freelancer-First", description: "Every decision we make starts with the question: does this help freelancers find better clients faster?" },
  { icon: Zap, title: "Automation Without Spam", description: "We believe in smart, personalized outreach — not bulk spam. Our AI writes emails that respect prospects." },
  { icon: Heart, title: "Sustainable Businesses", description: "We want to help freelancers build real, sustainable businesses — not just quick gigs on race-to-the-bottom platforms." },
  { icon: Users, title: "Built in the Open", description: "We share our roadmap, listen to feedback, and build features our community actually asks for." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-30" />
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <h1 className="text-5xl font-extrabold text-foreground mb-6">
              We Built iCloseLeads <br />
              <span className="gradient-text">Because We Needed It</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              We were freelancers too. And we were tired of paying 20% platform fees to Upwork, competing in a race to the bottom on Fiverr, and spending 4 hours a day manually cold emailing with zero strategy.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-surface">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-6">The Problem We Solve</h2>
            <div className="prose-custom space-y-4 text-muted-foreground leading-relaxed">
              <p>The freelance market is massive — over 73 million freelancers in the US alone — but most of them are stuck on marketplaces that take a huge cut, control the relationship, and commoditize their skills.</p>
              <p>Direct outreach is 3x more effective than marketplace bidding, but it requires finding verified contacts, writing personalized proposals, and tracking everything — which takes more time than most freelancers have.</p>
              <p>iCloseLeads solves all three problems in a single platform. We use Hunter.io to find verified email addresses, GPT-4o to write personalized proposals, and Resend to send them with enterprise-grade deliverability.</p>
              <p>Our users report finding their first lead in under 2 minutes and landing their first new client within 2 weeks of consistent outreach.</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "12,000+", label: "Active Freelancers" },
                { value: "$4.2M+", label: "Revenue Generated" },
                { value: "350K+", label: "Leads Discovered" },
                { value: "18%", label: "Avg. Response Rate" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gradient-card border border-border rounded-2xl p-6 text-center">
                  <div className="text-3xl font-extrabold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-surface">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-gradient-card border border-border rounded-2xl p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-light" />
                    </div>
                    <h3 className="text-foreground font-semibold text-lg mb-2">{v.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">The Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member) => (
                <div key={member.name} className="bg-gradient-card border border-border rounded-2xl p-6 text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.bg} flex items-center justify-center text-foreground text-2xl font-bold mx-auto mb-4`}>
                    {member.initials}
                  </div>
                  <h3 className="text-foreground font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary-light text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
