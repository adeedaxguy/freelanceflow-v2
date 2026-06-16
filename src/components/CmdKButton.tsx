"use client";

export default function CmdKButton() {
  return (
    <button
      onClick={() =>
        (window as unknown as Record<string, (() => void) | undefined>).__openCommandPalette?.()
      }
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border text-muted-foreground text-xs hover:text-foreground hover:border-primary/40 transition-all"
    >
      <span>Search</span>
      <kbd className="px-1 py-0.5 bg-muted/50 rounded text-[10px] font-mono border border-border/60">
        ⌘K
      </kbd>
    </button>
  );
}
