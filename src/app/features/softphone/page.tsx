import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("softphone");

export const metadata: Metadata = featureMetadata(page);

export default function SoftphonePage() {
  return <FeatureMarketingPage page={page} />;
}
