const BLOG_IMAGE_SLUGS = new Set([
  "ai-lead-generation-for-freelancers-2026",
  "best-crm-for-freelancers-2025",
  "how-to-write-winning-freelance-proposals-2025",
  "find-local-businesses-without-website",
  "most-profitable-freelance-niches-2025",
  "how-seo-consultants-find-local-clients-using-lead-tools",
  "cold-email-templates-freelancers-2025",
  "lead-generation-for-freelancers-complete-guide",
  "how-to-find-freelance-clients-2025",
  "most-profitable-freelance-niches-2025-income",
  "lead-generation-freelancers-complete-guide-2025",
  "how-to-find-freelance-clients-2025-methods",
  "best-crm-for-high-ticket-closing-in-2026-compared-1780943583090",
  "best-crm-for-high-ticket-closing-in-2026-compared-1780943521022",
  "best-crm-for-high-ticket-closing-in-2026-compared-1780943504559",
  "best-crm-for-high-ticket-closing-in-2026-compared",
  "how-to-find-freelance-clients-without-cold-calling-in-2025",
  "how-to-find-high-paying-clients-2025",
  "cold-email-templates-that-get-responses",
  "best-niches-for-freelancers-2025",
  "how-to-price-freelance-services",
  "freelance-pipeline-30-day-system",
  "how-to-write-winning-freelance-proposal",
  "web-designers-find-local-business-clients-2026",
  "predictable-freelance-pipeline",
]);

const HIDDEN_BLOG_SLUGS = new Set([
  "best-crm-for-high-ticket-closing-in-2026-compared-1780943521022",
]);

export function isHiddenBlogSlug(slug: string): boolean {
  return HIDDEN_BLOG_SLUGS.has(slug);
}

export function getBlogCoverImage(slug: string, ...candidates: Array<string | null | undefined>): string {
  const existing = candidates.find(candidate => candidate && candidate.trim().length > 0);
  if (existing) return existing;
  return BLOG_IMAGE_SLUGS.has(slug) ? `/blog-images/${slug}.svg` : "/blog-images/default.svg";
}

export function getBlogCoverImageUrl(baseUrl: string, slug: string, ...candidates: Array<string | null | undefined>): string {
  const image = getBlogCoverImage(slug, ...candidates);
  if (/^https?:\/\//i.test(image)) return image;
  return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
}
