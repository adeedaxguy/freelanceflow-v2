"use client";

import { Star } from "lucide-react";
import type { Testimonial } from "@/data/marketing";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export default function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  return (
    <div
      style={{ transitionDelay: `${index * 80}ms` }}
      className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-gradient-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
        ))}
      </div>

      {/* Content */}
      <blockquote className="mb-6 line-clamp-5 flex-1 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-auto flex items-center gap-3 border-t border-border/50 pt-4">
        <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-foreground font-semibold text-sm">{testimonial.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {testimonial.role}{testimonial.company ? ` · ${testimonial.company}` : ""}
          </p>
        </div>
        {testimonial.niche && (
          <span className="ml-auto shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary-light">
            {testimonial.niche}
          </span>
        )}
      </div>
    </div>
  );
}
