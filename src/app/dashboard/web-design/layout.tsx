import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTrialAccessError } from "@/lib/trial-access";

export default async function WebDesignLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const error = session?.user?.id ? await getTrialAccessError(session.user.id) : { error: "Please sign in to create a website concept." };
  if (!error) return children;
  return <section className="p-6">
    <h1 className="text-2xl font-bold">Website design access</h1>
    <p className="mt-3 max-w-xl text-sm text-muted-foreground">{error.error}</p>
    <Link href="/dashboard/upgrade" className="mt-4 inline-block text-sm font-semibold text-primary-light">View plans</Link>
  </section>;
}
