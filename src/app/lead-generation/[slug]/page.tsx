import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LeadGenerationMarketingPage from "@/components/LeadGenerationMarketingPage";
import {
  getLeadGenerationPage,
  LEAD_GENERATION_PAGES,
  leadGenerationMetadata,
} from "@/data/lead-generation-pages";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LEAD_GENERATION_PAGES.map(page => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLeadGenerationPage(slug);
  if (!page) return { title: "Lead Generation Page Not Found" };
  return leadGenerationMetadata(page);
}

export default async function LeadGenerationDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = getLeadGenerationPage(slug);
  if (!page) notFound();
  return <LeadGenerationMarketingPage page={page} />;
}
