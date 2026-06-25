"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SiteBuilderRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/dashboard/web-design?${query}` : "/dashboard/web-design");
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      Loading web design studio...
    </main>
  );
}

export default function NewSiteBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-6 text-foreground">Loading web design studio...</div>}>
      <SiteBuilderRedirect />
    </Suspense>
  );
}
