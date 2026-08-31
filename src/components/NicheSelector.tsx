"use client";

/**
 * NicheSelector — compact multi-select with search + pill tags.
 * Replaces the old full-grid card layout. Much smaller footprint.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { NICHES, type NicheOption } from "@/types";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NicheSelectorProps {
  selected?: string[] | string;
  onChange: (ids: string[]) => void;
  className?: string;
  maxSelect?: number;
}

export default function NicheSelector({
  selected,
  onChange,
  className,
  maxSelect = 5,
}: NicheSelectorProps) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const containerRef        = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);
  const selectedIds = useMemo(
    () => Array.isArray(selected) ? selected : selected ? [selected] : [],
    [selected],
  );

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered: NicheOption[] = query.trim()
    ? NICHES.filter(n =>
        n.label.toLowerCase().includes(query.toLowerCase()) ||
        n.description.toLowerCase().includes(query.toLowerCase())
      )
    : NICHES;

  const toggle = useCallback((id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(s => s !== id));
    } else if (selectedIds.length < maxSelect) {
      onChange([...selectedIds, id]);
    }
  }, [selectedIds, onChange, maxSelect]);

  const remove = useCallback((id: string) => {
    onChange(selectedIds.filter(s => s !== id));
  }, [selectedIds, onChange]);

  const selectedNiches = NICHES.filter(n => selectedIds.includes(n.id));

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(value => !value);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select niches"
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left",
          open
            ? "border-primary/50 bg-surface ring-2 ring-primary/10"
            : "border-border bg-surface hover:border-primary/30"
        )}
      >
        {/* Pills or placeholder */}
        <div className="flex-1 flex flex-wrap gap-1.5 min-h-[24px] items-center">
          {selectedNiches.length === 0 ? (
            <span className="text-muted-foreground text-sm">Select niches (up to {maxSelect})…</span>
          ) : (
            selectedNiches.map(n => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/15 border border-primary/30 text-primary-light text-xs font-medium"
              >
                <span>{n.icon}</span>
                {n.label}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); remove(n.id); }}
                  className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                  aria-label={`Remove ${n.label}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))
          )}
        </div>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange([]); }}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Clear all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180")} />
      </div>

      {/* Count badge */}
      {selectedIds.length > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center z-10">
          {selectedIds.length}
        </span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search niches…"
                className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {selectedIds.length >= maxSelect && (
              <p className="text-xs text-amber-400 mt-2 text-center">Max {maxSelect} niches selected</p>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto py-1.5" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No niches match "{query}"</p>
            ) : (
              filtered.map(n => {
                const isSelected = selectedIds.includes(n.id);
                const disabled   = !isSelected && selectedIds.length >= maxSelect;
                return (
                  <button
                    key={n.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={disabled}
                    onClick={() => toggle(n.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                      isSelected
                        ? "bg-primary/10 text-foreground"
                        : disabled
                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <span className="text-base w-6 text-center flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 text-left">
                      <p className={cn("font-medium text-sm", isSelected ? "text-primary-light" : "text-foreground")}>{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-light flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selectedIds.length > 0 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-background/50">
              <span className="text-xs text-muted-foreground">{selectedIds.length} / {maxSelect} selected</span>
              <button
                type="button"
                onClick={() => { setOpen(false); setQuery(""); }}
                className="text-xs font-semibold text-primary-light hover:text-foreground transition-colors"
              >
                Done ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
