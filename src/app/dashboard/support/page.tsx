"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Bot, Loader2, TicketCheck, MessageCircle, Sparkles, X } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const QUICK_QUESTIONS = [
  "How do I find leads?",
  "Why is my AI proposal not generating?",
  "How do I upgrade my plan?",
  "My emails aren't sending",
  "How do I export my leads?",
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! I'm the iCloseLeads support assistant. I can help you with leads, proposals, campaigns, billing, and anything else. What's on your mind?" },
  ]);
  const [input,         setInput]         = useState("");
  const [email,         setEmail]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].filter((m, i) => !(m.role === "assistant" && i === 0)),
          email: email || undefined,
        }),
      });
      const data = await res.json() as { reply?: string; ticketCreated?: boolean; error?: string };
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "Sorry, I couldn't process that. Please try again." }]);
      if (data.ticketCreated) setTicketCreated(true);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input); };
  const showChips = messages.length <= 1;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow-primary">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Chat</h1>
            <p className="text-muted-foreground text-sm">AI-powered help, 24/7. Complex issues escalate to our team.</p>
          </div>
        </div>
      </div>

      {/* Ticket created banner */}
      {ticketCreated && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl text-accent text-sm">
          <TicketCheck className="w-4 h-4 flex-shrink-0" />
          <span>Support ticket created — our team will follow up via email within 24 hours.</span>
        </div>
      )}

      {/* Chat window */}
      <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden flex flex-col" style={{ height: "min(560px, calc(100vh - 280px))" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${msg.role === "assistant" ? "bg-gradient-hero shadow-glow-primary" : "bg-primary/30 border border-primary/50"}`}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <span className="text-xs font-bold">Y</span>}
              </div>
              {/* Bubble */}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-surface border border-border text-foreground rounded-tl-sm"
                  : "bg-primary text-white rounded-tr-sm shadow-glow-primary/30"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick question chips */}
        {showChips && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light hover:bg-primary/20 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Describe your issue…"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white shadow-glow-primary hover:opacity-90 transition-opacity disabled:opacity-40">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* Email opt-in */}
      <div className="mt-4 bg-surface/50 border border-border/50 rounded-xl p-4 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-primary-light flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1.5">Add your email to receive ticket updates and follow-ups</p>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
