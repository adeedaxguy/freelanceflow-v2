import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getBlogCoverImage } from "@/lib/blog-images";
import type { BlogPost } from "@/types";

interface BlogCardProps {
  post: BlogPost;
}

const categoryColors: Record<string, string> = {
  "Strategy": "text-primary-light bg-primary/10 border-primary/20",
  "Templates": "text-accent bg-accent/10 border-accent/20",
  "Growth": "text-gold bg-gold/10 border-gold/20",
  "Tools": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "General": "text-muted-foreground bg-muted border-border",
};

export default function BlogCard({ post }: BlogCardProps) {
  const colorClass = categoryColors[post.category] ?? categoryColors["General"];
  const coverImage = getBlogCoverImage(post.slug, post.coverImage);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-gradient-card border border-border hover:border-primary/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card-hover flex flex-col"
    >
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-primary/20 via-surface to-accent/10 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage}
          alt=""
          width={768}
          height={384}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-dot-pattern bg-dot-sm opacity-30" />
        <div className="absolute bottom-4 left-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-foreground font-semibold text-lg leading-snug mb-2 group-hover:text-primary-light transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {post.readTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
