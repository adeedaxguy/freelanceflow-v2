import type { Metadata } from "next";
import SitePreviewPageContent, {
  type SitePreviewSearchParams,
} from "@/components/SitePreviewPageContent";

export const metadata: Metadata = {
  title: "Website Preview",
  description: "A client-facing local business homepage preview.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SitePreviewPage(props: { searchParams?: SitePreviewSearchParams }) {
  return <SitePreviewPageContent {...props} />;
}
