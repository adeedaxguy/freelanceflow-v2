import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "accent" | "gold" | "red" | "blue" | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary-light border border-primary/20",
  accent: "bg-accent/15 text-accent border border-accent/20",
  gold: "bg-gold/15 text-gold border border-gold/20",
  red: "bg-red-500/15 text-red-400 border border-red-500/20",
  blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  outline: "border border-border text-muted-foreground",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    NEW: { label: "New", variant: "blue" },
    PROPOSAL_SENT: { label: "Proposal Sent", variant: "primary" },
    REPLIED: { label: "Replied", variant: "accent" },
    CLOSED: { label: "Closed", variant: "gold" },
  };

  const config = statusConfig[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function EmailStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    SENT: { label: "Sent", variant: "blue" },
    DELIVERED: { label: "Delivered", variant: "accent" },
    OPENED: { label: "Opened", variant: "primary" },
    READY_TO_SEND: { label: "Prepared", variant: "gold" },
    BOUNCED: { label: "Bounced", variant: "red" },
    FAILED: { label: "Failed", variant: "red" },
  };

  const config = statusConfig[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function CampaignStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    DRAFT: { label: "Draft", variant: "outline" },
    RUNNING: { label: "Active", variant: "accent" },
    COMPLETED: { label: "Completed", variant: "primary" },
  };

  const config = statusConfig[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
