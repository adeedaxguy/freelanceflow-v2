import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://icloseleads.com";

const STATIC_PAGES: { url: string; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"; priority: number }[] = [
  // Marketing
  { url: "",             changeFrequency: "weekly",  priority: 1.0  },
  { url: "/features",    changeFrequency: "monthly", priority: 0.9  },
  { url: "/pricing",     changeFrequency: "weekly",  priority: 0.9  },
  { url: "/blog",        changeFrequency: "daily",   priority: 0.85 },
  { url: "/about",       changeFrequency: "monthly", priority: 0.8  },
  { url: "/contact",     changeFrequency: "monthly", priority: 0.7  },
  // Product
  { url: "/changelog",   changeFrequency: "weekly",  priority: 0.75 },
  { url: "/status",      changeFrequency: "hourly",  priority: 0.7  },
  // Company
  { url: "/careers",     changeFrequency: "weekly",  priority: 0.7  },
  { url: "/press",       changeFrequency: "monthly", priority: 0.6  },
  { url: "/affiliate",   changeFrequency: "monthly", priority: 0.65 },
  // Legal / Support
  { url: "/help",        changeFrequency: "weekly",  priority: 0.65 },
  { url: "/privacy",     changeFrequency: "yearly",  priority: 0.5  },
  { url: "/terms",       changeFrequency: "yearly",  priority: 0.5  },
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

  return [...staticEntries, ...blogEntries];
}
