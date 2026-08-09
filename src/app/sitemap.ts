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
    priority: 0.78,
  })),
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
        priority: 0.8,
      }));
  } catch { /* blog table may not exist yet */ }

  const dbBlogUrls = new Set(blogEntries.map(entry => entry.url));
  const staticBlogEntries = STATIC_POSTS
    .filter(post => post.published && !isHiddenBlogSlug(post.slug))
    .map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
    .filter(entry => !dbBlogUrls.has(entry.url));

  return [...staticEntries, ...blogEntries, ...staticBlogEntries];
}
