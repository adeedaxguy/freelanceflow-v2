import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )}
    />
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function LeadsTableSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-6 w-48" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} cols={6} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
