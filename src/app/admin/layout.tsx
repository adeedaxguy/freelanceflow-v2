import { type ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AdminSidebar from "@/components/AdminSidebar";
import { authOptions } from "@/lib/auth";

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

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/admin/login");

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
