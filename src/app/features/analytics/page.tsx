import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("analytics");

export const metadata: Metadata = featureMetadata(page);

export default function AnalyticsPage() {
  return <FeatureMarketingPage page={page} />;
}
