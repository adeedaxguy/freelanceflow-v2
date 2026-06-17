import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("lead-discovery");

export const metadata: Metadata = featureMetadata(page);

export default function LeadDiscoveryPage() {
  return <FeatureMarketingPage page={page} />;
}
