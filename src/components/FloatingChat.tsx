"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const QUICK_QUESTIONS = [
  "How do I find more leads?",
  "How does AI Apply work?",
  "How to upgrade my plan?",
  "Why am I not getting leads?",
];

export default function FloatingChat() {
  const [open,       setOpen]      = useState(false);
  const [messages,   setMessages]  = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm FreelanceFlow's AI assistant. How can I help you find clients and grow your freelance business today? 🚀" },
  ]);
  const [input,      setInput]     = useState("");
  const [loading,    setLoading]   = useState(false);
  const [ticket,     setTicket]    = useState(false);
  const [unread,     setUnread]    = useState(0);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      });
      type ChatResponse = { reply?: string; ticketCreated?: boolean; error?: string };
      const data = await res.json() as ChatResponse;
      const reply = data.reply ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if (data.ticketCreated) setTicket(true);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, open]);

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Chat panel */}
      <div className={`fixed bottom-24 right-4 sm:right-6 z-50 transition-all duration-300 ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}`}>
        <div className="w-[calc(100vw-32px)] sm:w-[380px] bg-surface border border-border rounded-2xl shadow-card-hover overflow-hidden flex flex-col"
          style={{ maxHeight: "min(560px, calc(100vh - 120px))" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-accent/10 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow-primary/30 flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">FreelanceFlow AI</div>
                <div className="text-[10px] text-accent flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Online · Replies instantly
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-primary text-white" : "bg-primary/15 text-primary-light"}`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-background border border-border text-foreground rounded-tl-sm"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary-light flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-background border border-border rounded-xl rounded-tl-sm px-3 py-2">
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                </div>
              </div>
            )}
            {ticket && (
              <div className="text-xs text-center text-muted-foreground bg-primary/5 border border-primary/10 rounded-xl px-3 py-2">
                ✅ A support ticket has been created. Our team will follow up via email.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => void sendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary-light transition-all bg-background">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border flex-shrink-0">
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2 focus-within:border-primary/50">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); }}}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none" />
              <button onClick={() => void sendMessage(input)} disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB button */}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-hero shadow-glow-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Open support chat">
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
