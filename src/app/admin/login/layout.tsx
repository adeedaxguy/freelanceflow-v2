import { type ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login — iCloseLeads",
  robots: { index: false, follow: false },
};

// Standalone layout — no auth check, no admin sidebar.
// Intentionally overrides the parent /admin/layout.tsx for this route.
export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
