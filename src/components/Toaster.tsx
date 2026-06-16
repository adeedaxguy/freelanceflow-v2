"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; type?: ToastType }) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ─── Style maps ───────────────────────────────────────────────────────────────
const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, { icon: string; container: string }> = {
  success: { icon: "text-accent",           container: "bg-surface border-accent/30" },
  error:   { icon: "text-destructive",      container: "bg-surface border-destructive/30" },
  info:    { icon: "text-primary-light",    container: "bg-surface border-primary/30" },
  warning: { icon: "text-gold",             container: "bg-surface border-gold/30" },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({
    title,
    description,
    type = "info",
  }: {
    title: string;
    description?: string;
    type?: ToastType;
  }) => {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, title, description, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Expose globally for use outside React (e.g. in API call handlers)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__toast = toast;
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom right */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[10000] flex flex-col gap-2.5 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => {
            const Icon    = ICONS[t.type];
            const colors  = COLORS[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, x: 60,  scale: 0.94 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border ${colors.container} backdrop-blur-md shadow-xl shadow-black/30 min-w-[260px] max-w-xs`}
              >
                <Icon className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold leading-snug">{t.title}</p>
                  {t.description && (
                    <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
