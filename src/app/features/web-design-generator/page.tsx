import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("web-design-generator");

export const metadata: Metadata = featureMetadata(page);

export default function WebDesignGeneratorPage() {
  return <FeatureMarketingPage page={page} />;
}
