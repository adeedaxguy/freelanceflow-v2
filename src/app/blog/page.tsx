import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { STATIC_POSTS } from "@/data/blog-posts";
import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/types";

export const dynamic = "force-dynamic"; // always fetch latest posts

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

const categories = ["all", "Strategy", "Templates", "Growth", "Tools", "Client Acquisition", "Lead Generation", "Outreach", "Freelance Business", "Local Business", "Proposals"];

export default async function BlogPage() {
  // Fetch DB posts (published only)
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
    dbPosts = raw.map(p => ({
      ...p,
      excerpt: p.excerpt ?? "",
      coverImage: p.coverImage ?? null,
    }));
  } catch {
    // DB suspended or unavailable — fall back to static only
  }

  // Merge: DB posts first (newest), then static posts (dedup by slug)
  const dbSlugs = new Set(dbPosts.map(p => p.slug));
  const staticOnly = STATIC_POSTS.filter(p => !dbSlugs.has(p.slug));
  const allPosts: BlogPost[] = [
    ...dbPosts,
    ...staticOnly,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
                {allPosts.length} articles · New posts daily
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={cat === "all" ? "/blog" : `/blog?category=${cat}`}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:border-primary/40 hover:text-primary-light transition-colors capitalize"
                >
                  {cat}
                </a>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map((post) => (
                <BlogCard key={post.id ?? post.slug} post={post} />
              ))}
            </div>

            {allPosts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No posts yet. Check back soon.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
