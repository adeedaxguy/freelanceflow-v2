const HIDDEN_BLOG_SLUGS = new Set([
  "best-crm-for-high-ticket-closing-in-2026-compared-1780943521022",
  "freelancer-client-acquisition-system",
]);

export function isHiddenBlogSlug(slug: string): boolean {
  return HIDDEN_BLOG_SLUGS.has(slug);
}

export function getBlogCoverImage(slug: string, ...candidates: Array<string | null | undefined>): string {
  const existing = candidates.find(candidate => candidate && candidate.trim().length > 0);
  if (existing && /^https?:\/\//i.test(existing)) return existing;
  if (existing && !existing.startsWith("/blog-images/")) return existing;
  return `/api/blog-cover/${encodeURIComponent(slug)}.svg`;
}

export function getBlogCoverImageUrl(baseUrl: string, slug: string, ...candidates: Array<string | null | undefined>): string {
  const image = getBlogCoverImage(slug, ...candidates);
  if (/^https?:\/\//i.test(image)) return image;
  return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
}
