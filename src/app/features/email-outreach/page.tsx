import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("email-outreach");

export const metadata: Metadata = featureMetadata(page);

export default function EmailOutreachPage() {
  return <FeatureMarketingPage page={page} />;
}
