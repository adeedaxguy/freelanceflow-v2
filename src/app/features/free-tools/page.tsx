import type { Metadata } from "next";
import FeatureMarketingPage from "@/components/FeatureMarketingPage";
import { featureMetadata, getFeaturePage } from "@/data/feature-pages";

const page = getFeaturePage("free-tools");

export const metadata: Metadata = featureMetadata(page);

export default function FreeToolsPage() {
  return <FeatureMarketingPage page={page} />;
}
