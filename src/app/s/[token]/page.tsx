import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePreviewContent } from "@/components/SitePreviewPageContent";
import { decodeSiteShare } from "@/lib/site-share";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Website Concept",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SharedSitePreviewPage({ params }: { params: { token: string } }) {
  const searchParams = decodeSiteShare(params.token);
  if (!searchParams) notFound();
  return <SitePreviewContent searchParams={{ ...searchParams, client: "1" }} />;
}
