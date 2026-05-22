import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { STATIC_POSTS } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Freelance Tips & Client Acquisition Strategies | FreelanceFlow Blog",
  description: "Expert advice on finding freelance clients, writing winning proposals, cold email strategies, and growing your freelance business.",
};

const categories = ["all", "Strategy", "Templates", "Growth", "Tools"];

export default function BlogPage() {
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
              {STATIC_POSTS.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
