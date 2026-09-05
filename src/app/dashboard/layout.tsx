import React, { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import OnboardingTour from "@/components/OnboardingTour";
import FloatingHelpButton from "@/components/FloatingHelpButton";
import SignupAnalytics from "@/components/SignupAnalytics";
import { DashboardRouteMotion } from "@/components/AppRouteMotion";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth");

  return (
    <div className="dashboard-shell flex min-h-screen bg-background">
      <SignupAnalytics createdAt={session.user.createdAt} />
      {/* Sidebar: desktop aside + mobile top-bar + mobile slide drawer */}
      <Sidebar />

      {/* Main content
          pt-14 = offset for the fixed mobile top-bar (h-14)
          pb-20 lg:pb-0 = clearance for the mobile bottom nav (h-16 + safe area) */}
      <main className="dashboard-content flex-1 min-w-0 overflow-auto pt-14 pb-20 lg:pt-0 lg:pb-0">
        <ErrorBoundary section="Dashboard">
          <DashboardRouteMotion>{children}</DashboardRouteMotion>
        </ErrorBoundary>
      </main>

      {/* Mobile bottom navigation — 5-tab bar that feels like a native app */}
      <MobileBottomNav />

      {/* Floating help button — hidden on mobile to avoid clashing with bottom nav */}
      <div className="hidden lg:block">
        <FloatingHelpButton />
      </div>

      {/* Onboarding tour — shown once to new users, stored in localStorage */}
      <OnboardingTour />
    </div>
  );
}
