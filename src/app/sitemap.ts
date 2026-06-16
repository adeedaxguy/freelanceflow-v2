import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://icloseleads.com";

// Programmatic landing pages — /for/[industry]
const INDUSTRY_PAGES = [
  "web-designers",
  "marketing-agencies",
  "freelance-copywriters",
  "seo-consultants",
  "graphic-designers",
  "video-editors",
  "social-media-managers",
  "wordpress-developers",
  "shopify-experts",
  "virtual-assistants",
  "mobile-app-developers",
  "data-scientists",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    // Core marketing — highest priority
    { url: BASE_URL,                                    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/pricing`,                       lastModified: now, changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE_URL}/features`,                      lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Feature pages — excellent for long-tail SEO
    { url: `${BASE_URL}/features/lead-discovery`,       lastModified: now, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/features/ai-proposals`,         lastModified: now, changeFrequency: "monthly", priority: 0.88 },
    { url: `${BASE_URL}/features/crm-pipeline`,         lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/features/email-outreach`,       lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/features/analytics`,            lastModified: now, changeFrequency: "monthly", priority: 0.82 },
    { url: `${BASE_URL}/features/free-tools`,           lastModified: now, changeFrequency: "monthly", priority: 0.82 },

    // Free tools — great organic entry points
    { url: `${BASE_URL}/tools/lead-calculator`,         lastModified: now, changeFrequency: "monthly", priority: 0.85 },

    // Blog hub
    { url: `${BASE_URL}/blog`,                          lastModified: now, changeFrequency: "daily",   priority: 0.85 },

    // Company
    { url: `${BASE_URL}/about`,                         lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/contact`,                       lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/help`,                          lastModified: now, changeFrequency: "weekly",  priority: 0.65 },
    { url: `${BASE_URL}/changelog`,                     lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/careers`,                       lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/affiliate`,                     lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/status`,                        lastModified: now, changeFrequency: "hourly",  priority: 0.5 },
    { url: `${BASE_URL}/press`,                         lastModified: now, changeFrequency: "monthly", priority: 0.55 },

    // Legal
    { url: `${BASE_URL}/privacy`,                       lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/terms`,                         lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/cookie-policy`,                 lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // /for/[industry] programmatic pages — great for niche SEO
  const industryPages: MetadataRoute.Sitemap = INDUSTRY_PAGES.map(slug => ({
    url: `${BASE_URL}/for/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.87,
  }));

  // Dynamic blog posts from DB
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    blogEntries = posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch { /* blog table may not exist yet */ }

  return [...staticPages, ...industryPages, ...blogEntries];
}
