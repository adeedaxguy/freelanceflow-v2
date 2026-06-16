"use client";

import { useState, type FormEvent } from "react";
import { Mail, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
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
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
              <h1 className="text-5xl font-extrabold text-foreground mb-4">Get in <span className="gradient-text">Touch</span></h1>
              <p className="text-muted-foreground text-lg">We typically respond within 4 business hours.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                {[
                  { icon: Mail, title: "Email Us", value: "hello@freelanceflow.io", sub: "For general enquiries" },
                  { icon: MessageSquare, title: "Support", value: "support@freelanceflow.io", sub: "For technical help" },
                  { icon: Clock, title: "Response Time", value: "Under 4 hours", sub: "Monday – Friday, 9am–6pm EST" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4 p-5 bg-gradient-card border border-border rounded-2xl">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-light" />
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">{item.title}</div>
                        <div className="text-primary-light text-sm">{item.value}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form */}
              <div className="bg-gradient-card border border-border rounded-2xl p-8">
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="text-foreground font-bold text-xl mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We will get back to you within 4 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
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
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all shadow-glow-primary disabled:opacity-50"
                    >
                      {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
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
