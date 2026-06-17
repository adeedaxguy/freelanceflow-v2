import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("ai-proposals");

export const metadata: Metadata = featureMetadata(page);

export default function AIProposalsPage() {
  return <FeatureMarketingPage page={page} />;
}
