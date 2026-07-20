import { type ReactNode } from "react";
import { headers } from "next/headers";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = { title: "iCloseLeads Admin" };

// Auth is enforced by middleware (src/middleware.ts).
// This layout provides admin chrome (sidebar + mobile header), but skips it for /admin/login.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Admin login page renders standalone — no sidebar chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* AdminSidebar handles desktop aside + mobile drawer + mobile top bar */}
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
