"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Underline, AlignLeft, RotateCcw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/clipboard";

interface ProposalEditorProps {
  value: string;
  onChange: (value: string) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  previewMode?: boolean;
}

export default function ProposalEditor({
  value,
  onChange,
  subject,
  onSubjectChange,
  placeholder = "Your proposal will appear here...",
  className,
  previewMode = false,
}: ProposalEditorProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after: string = before) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.setSelectionRange(start + before.length, end + before.length);
      ta.focus();
    });
  }

  async function handleCopy() {
    await copyText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (previewMode) {
    return (
      <div className={cn("bg-background border border-border rounded-2xl overflow-hidden", className)}>
        <div className="px-6 py-4 border-b border-border bg-surface/50">
          <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Subject</p>
          <p className="text-foreground font-medium">{subject || "(no subject)"}</p>
        </div>
        <div className="p-6">
          <pre className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {value || <span className="text-muted-foreground italic">No content yet</span>}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-surface border border-border rounded-2xl overflow-hidden", className)}>
      {/* Subject line */}
      <div className="px-4 py-3 border-b border-border">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Enter email subject..."
          className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-background/30">
        {[
          { icon: Bold, action: () => wrapSelection("**"), title: "Bold" },
          { icon: Italic, action: () => wrapSelection("_"), title: "Italic" },
          { icon: Underline, action: () => wrapSelection("<u>", "</u>"), title: "Underline" },
          { icon: AlignLeft, action: () => onChange(value + "\n\n"), title: "New paragraph" },
        ].map(({ icon: Icon, action, title }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            aria-label={title}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => onChange("")}
            title="Clear"
            className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Clear editor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="p-1.5 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
            aria-label="Copy content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={14}
        className="w-full bg-transparent text-foreground text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none resize-none p-4"
        aria-label="Proposal content"
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.split(/\s+/).filter(Boolean).length} words</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
