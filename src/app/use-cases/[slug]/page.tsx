import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UseCaseMarketingPage from "@/components/UseCaseMarketingPage";
import { getUseCasePage, USE_CASE_PAGES, useCaseMetadata as getUseCaseMetadata } from "@/data/use-case-pages";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return USE_CASE_PAGES.map(page => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getUseCasePage(slug);
  if (!page) return { title: "Use Case Not Found" };
  return getUseCaseMetadata(page);
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params;
  const page = getUseCasePage(slug);
  if (!page) notFound();
  return <UseCaseMarketingPage page={page} />;
}
