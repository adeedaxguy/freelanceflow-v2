import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UseCaseMarketingPage from "@/components/UseCaseMarketingPage";
import { getUseCasePage, USE_CASE_PAGES, useCaseMetadata as getUseCaseMetadata } from "@/data/use-case-pages";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return USE_CASE_PAGES.map(page => ({ slug: page.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getUseCasePage(params.slug);
  if (!page) return { title: "Use Case Not Found" };
  return getUseCaseMetadata(page);
}

export default function UseCasePage({ params }: Props) {
  const page = getUseCasePage(params.slug);
  if (!page) notFound();
  return <UseCaseMarketingPage page={page} />;
}
