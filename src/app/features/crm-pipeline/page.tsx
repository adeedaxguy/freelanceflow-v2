import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("crm-pipeline");

export const metadata: Metadata = featureMetadata(page);

export default function CRMPipelinePage() {
  return <FeatureMarketingPage page={page} />;
}
