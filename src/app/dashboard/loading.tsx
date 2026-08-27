import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="dashboard-page flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center" role="status" aria-live="polite">
        <Loader2 className="h-7 w-7 animate-spin text-primary-light" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Loading workspace…</p>
      </div>
    </div>
  );
}
