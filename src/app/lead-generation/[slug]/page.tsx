import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeadGenerationMarketingPage from "@/components/LeadGenerationMarketingPage";
import {
  getLeadGenerationPage,
  LEAD_GENERATION_PAGES,
  leadGenerationMetadata,
} from "@/data/lead-generation-pages";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return LEAD_GENERATION_PAGES.map(page => ({ slug: page.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getLeadGenerationPage(params.slug);
  if (!page) return { title: "Lead Generation Page Not Found" };
  return leadGenerationMetadata(page);
}

export default function LeadGenerationDetailPage({ params }: Props) {
  const page = getLeadGenerationPage(params.slug);
  if (!page) notFound();
  return <LeadGenerationMarketingPage page={page} />;
}
