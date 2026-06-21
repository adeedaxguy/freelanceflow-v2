import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { STATIC_POSTS } from "@/data/blog-posts";
import { getBlogCoverImage, isHiddenBlogSlug } from "@/lib/blog-images";
import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 15;

export const metadata: Metadata = {
  title: "Freelance Tips & Client Acquisition Strategies | iCloseLeads Blog",
  description: "Expert advice on finding freelance clients, writing winning proposals, cold email strategies, and growing your freelance business.",
  alternates: { canonical: "https://icloseleads.com/blog" },
  openGraph: {
    title: "iCloseLeads Blog — Freelance Growth Playbook",
    description: "Actionable strategies, templates, and insights to grow your freelance business.",
    url: "https://icloseleads.com/blog",
    type: "website",
  },
};

type BlogPageProps = {
  searchParams?: {
    category?: string | string[];
    page?: string | string[];
  };
};

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push("ellipsis-end");
  items.push(totalPages);

  return items;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const selectedCategory = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;
  const activeCategory = selectedCategory?.trim().toLowerCase() || "all";

  let dbPosts: BlogPost[] = [];
  try {
    const raw = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        content: true, category: true, published: true,
        coverImage: true, readTime: true, createdAt: true, updatedAt: true,
      },
    });
    dbPosts = raw
      .filter(post => !isHiddenBlogSlug(post.slug) && post.excerpt?.trim().toLowerCase() !== "test excerpt")
      .map(post => ({
        ...post,
        excerpt: post.excerpt ?? "",
        coverImage: getBlogCoverImage(post.slug, post.coverImage),
      }));
  } catch {
    dbPosts = [];
  }

  const dbSlugs = new Set(dbPosts.map(post => post.slug));
  const staticOnly = STATIC_POSTS
    .filter(post => post.published && !dbSlugs.has(post.slug) && !isHiddenBlogSlug(post.slug))
    .map(post => ({ ...post, coverImage: getBlogCoverImage(post.slug, post.coverImage) }));
  const seenTitles = new Set<string>();
  const publishedPosts = [...dbPosts, ...staticOnly]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .filter(post => {
      const key = post.title.trim().toLowerCase();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });
  const categories = [
    "All",
    ...Array.from(new Set(publishedPosts.map(post => post.category).filter(Boolean))),
  ];
  const posts = activeCategory === "all"
    ? publishedPosts
    : publishedPosts.filter(post => post.category.toLowerCase() === activeCategory);
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(parsePage(searchParams?.page), totalPages);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  const activeCategoryLabel = categories.find(cat => cat.toLowerCase() === activeCategory);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (activeCategory !== "all" && activeCategoryLabel) {
      params.set("category", activeCategoryLabel);
    }
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/blog?${query}` : "/blog";
  };
  const firstVisiblePost = posts.length === 0 ? 0 : startIndex + 1;
  const lastVisiblePost = Math.min(startIndex + POSTS_PER_PAGE, posts.length);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-extrabold text-foreground mb-4">
                Freelance Growth <span className="gradient-text">Playbook</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Actionable strategies, templates, and insights to grow your freelance business.
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                {publishedPosts.length} articles · Updated regularly
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={cat.toLowerCase() === "all" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                    activeCategory === cat.toLowerCase()
                      ? "bg-primary/15 border-primary/40 text-primary-light"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary-light"
                  }`}
                >
                  {cat}
                </a>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <BlogCard key={post.id ?? post.slug} post={post} />
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No posts found in this category.
              </div>
            )}

            {posts.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-5">
                <p className="text-sm text-muted-foreground">
                  Showing {firstVisiblePost}-{lastVisiblePost} of {posts.length} articles
                </p>

                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 flex-wrap" aria-label="Blog pagination">
                    <a
                      href={pageHref(Math.max(1, currentPage - 1))}
                      aria-disabled={currentPage === 1}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                        currentPage === 1
                          ? "pointer-events-none border-border/60 text-muted-foreground/40"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary-light"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </a>

                    {paginationItems.map((item) => (
                      typeof item === "number" ? (
                        <a
                          key={item}
                          href={pageHref(item)}
                          aria-current={item === currentPage ? "page" : undefined}
                          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors ${
                            item === currentPage
                              ? "border-primary/40 bg-primary/15 text-primary-light"
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary-light"
                          }`}
                        >
                          {item}
                        </a>
                      ) : (
                        <span
                          key={item}
                          className="inline-flex h-10 min-w-10 items-center justify-center text-muted-foreground/60"
                          aria-hidden="true"
                        >
                          ...
                        </span>
                      )
                    ))}

                    <a
                      href={pageHref(Math.min(totalPages, currentPage + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                        currentPage === totalPages
                          ? "pointer-events-none border-border/60 text-muted-foreground/40"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary-light"
                      }`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </nav>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
