import React, { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:flex flex-shrink-0">
        <AdminSidebar />
      </div>
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
