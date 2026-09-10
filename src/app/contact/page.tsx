"use client";

import { useState, type FormEvent } from "react";
import { Mail, Clock, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Unable to submit. Please email hello@icloseleads.com.");
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to submit. Please email hello@icloseleads.com.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">Contact iCloseLeads Support</h1>
              <p className="text-muted-foreground text-lg">Account, billing, leads, or calling. No sign-in required.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                {[
                  { icon: Mail, title: "Email Us", value: "hello@icloseleads.com", sub: "For general enquiries" },
                  { icon: MessageSquare, title: "Support", value: "support@icloseleads.com", sub: "For technical help" },
                  { icon: Clock, title: "Follow-up", value: "Replies by email", sub: "Include the page and what happened. Never send passwords or card details." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4 p-5 bg-gradient-card border border-border rounded-2xl">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-light" />
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">{item.title}</div>
                        <div className="text-primary-light text-sm break-words">{item.value.includes("@") ? <a href={`mailto:${item.value}`} className="hover:underline">{item.value}</a> : item.value}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form */}
              <div className="bg-gradient-card border border-border rounded-2xl p-8">
                {success ? (
                  <div className="text-center py-8" role="status">
                    <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="text-foreground font-bold text-xl mb-2">Request received</h3>
                    <p className="text-muted-foreground break-words">Your message is saved with our support team. We will reply to {form.email}.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        maxLength={254}
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                      <textarea
                        id="contact-message"
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all shadow-glow-primary disabled:opacity-50"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
