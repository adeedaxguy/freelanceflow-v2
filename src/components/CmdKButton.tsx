"use client";

export default function CmdKButton() {
  return (
    <button
      onClick={() =>
        (window as unknown as Record<string, (() => void) | undefined>).__openCommandPalette?.()
      }
      className="dashboard-action-pill hidden sm:flex items-center gap-2 rounded-full px-3.5 py-2 text-xs transition-colors"
    >
      <span>Search</span>
      <kbd className="px-1 py-0.5 bg-muted/50 rounded text-[10px] font-mono border border-border/60">
        ⌘K
      </kbd>
    </button>
  );
}
