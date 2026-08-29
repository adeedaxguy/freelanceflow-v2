import { MetadataRoute } from "next";
import { STATIC_POSTS } from "@/data/blog-posts";
import { FEATURE_PAGES } from "@/data/feature-pages";
import { LEAD_GENERATION_PAGES } from "@/data/lead-generation-pages";
import { RESOURCE_PAGES } from "@/data/resource-pages";
import { USE_CASE_PAGES } from "@/data/use-case-pages";
import { isHiddenBlogSlug } from "@/lib/blog-images";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com";
const INDUSTRY_PAGES = [
  "/for/web-designers",
  "/for/marketing-agencies",
  "/for/freelance-copywriters",
  "/for/seo-consultants",
  "/for/wordpress-developers",
  "/for/real-estate-brokers",
  "/for/shopify-developers",
] as const;

const RESOURCE_PRIORITY_OVERRIDES: Record<string, number> = {
  "web-design-lead-generation": 0.84,
};

const BLOG_PRIORITY_OVERRIDES: Record<string, number> = {
  "freelance-client-acquisition-system": 0.86,
  "softphone-for-freelance-lead-outreach": 0.85,
  "softphone-for-sales-teams-client-acquisition": 0.86,
  "prompt-to-website-design-for-client-pitches": 0.85,
  "best-ai-website-builder-small-business-client-acquisition": 0.85,
  "customer-acquisition-cost-for-freelancers-free-leads": 0.84,
  "dental-website-leads-for-freelancers": 0.84,
  "med-spa-website-leads-for-web-designers": 0.84,
  "roofing-company-website-leads": 0.84,
  "kitchen-remodeling-website-leads": 0.84,
  "family-law-firm-website-leads": 0.84,
  "managed-it-service-provider-website-leads": 0.84,
  "600-free-leads-week-client-acquisition-plan": 0.84,
  "web-design-leads-data-led-workflow": 0.84,
  "local-business-leads-scorecard-for-freelancers": 0.84,
  "proposal-ready-leads-for-freelancers": 0.84,
  "client-acquisition-software-free-plan-test": 0.83,
  "free-business-leads-for-freelancers": 0.86,
  "how-to-get-free-leads-for-my-business": 0.85,
  "business-leads-database-free-vs-qualified-leads": 0.84,
  "client-acquisition-software-for-freelancers-free-leads-crm": 0.86,
  "sales-softphone-for-freelancers-us-canada-uk-numbers": 0.85,
};

const STATIC_PAGES: { url: string; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"; priority: number }[] = [
  // Marketing
  { url: "",             changeFrequency: "weekly",  priority: 1.0  },
  { url: "/features",    changeFrequency: "weekly",  priority: 0.9  },
  ...FEATURE_PAGES.map(page => ({
    url: page.path,
    changeFrequency: "weekly" as const,
    priority: 0.86,
  })),
  { url: "/lead-generation", changeFrequency: "weekly", priority: 0.9 },
  ...LEAD_GENERATION_PAGES.map(page => ({
    url: page.path,
    changeFrequency: "weekly" as const,
    priority: 0.89,
  })),
  { url: "/use-cases",   changeFrequency: "weekly",  priority: 0.9  },
  ...USE_CASE_PAGES.map(page => ({
    url: page.path,
    changeFrequency: "weekly" as const,
    priority: 0.88,
  })),
  { url: "/pricing",     changeFrequency: "weekly",  priority: 0.9  },
  { url: "/blog",        changeFrequency: "daily",   priority: 0.85 },
  { url: "/resources",   changeFrequency: "weekly",  priority: 0.84 },
  ...RESOURCE_PAGES.map(page => ({
    url: `/resources/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: RESOURCE_PRIORITY_OVERRIDES[page.slug] ?? 0.78,
  })),
  { url: "/tools/lead-calculator", changeFrequency: "monthly", priority: 0.72 },
  { url: "/about",       changeFrequency: "monthly", priority: 0.8  },
  { url: "/contact",     changeFrequency: "monthly", priority: 0.7  },
  ...INDUSTRY_PAGES.map(url => ({
    url,
    changeFrequency: "weekly" as const,
    priority: 0.82,
  })),
  // Product
  { url: "/changelog",   changeFrequency: "weekly",  priority: 0.75 },
  { url: "/status",      changeFrequency: "hourly",  priority: 0.7  },
  { url: "/developers",  changeFrequency: "weekly",  priority: 0.72 },
  // Company
  { url: "/careers",     changeFrequency: "weekly",  priority: 0.7  },
  { url: "/press",       changeFrequency: "monthly", priority: 0.6  },
  { url: "/affiliate",   changeFrequency: "monthly", priority: 0.65 },
  // Legal / Support
  { url: "/help",        changeFrequency: "weekly",  priority: 0.65 },
  { url: "/privacy",     changeFrequency: "yearly",  priority: 0.5  },
  { url: "/terms",       changeFrequency: "yearly",  priority: 0.5  },
  { url: "/refund-policy", changeFrequency: "yearly", priority: 0.5 },
  { url: "/cookie-policy", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticEntries = STATIC_PAGES.map(({ url, changeFrequency, priority }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Dynamic blog posts
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    const seenTitles = new Set<string>();
    blogEntries = posts
      .filter(post => !isHiddenBlogSlug(post.slug))
      .filter(post => {
        const key = post.title.trim().toLowerCase();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      })
      .map(post => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: BLOG_PRIORITY_OVERRIDES[post.slug] ?? 0.8,
      }));
  } catch { /* blog table may not exist yet */ }

  const dbBlogUrls = new Set(blogEntries.map(entry => entry.url));
  const staticBlogEntries = STATIC_POSTS
    .filter(post => post.published && !isHiddenBlogSlug(post.slug))
    .map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: BLOG_PRIORITY_OVERRIDES[post.slug] ?? 0.8,
    }))
    .filter(entry => !dbBlogUrls.has(entry.url));

  const seenUrls = new Set<string>();

  return [...staticEntries, ...blogEntries, ...staticBlogEntries].filter(entry => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });
}
