"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Testimonial } from "@/data/marketing";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

export default function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-gradient-card border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover flex flex-col"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-foreground font-semibold text-sm">{testimonial.name}</p>
          <p className="text-muted-foreground text-xs">
            {testimonial.role}{testimonial.company ? ` · ${testimonial.company}` : ""}
          </p>
        </div>
        {testimonial.niche && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-primary/10 text-primary-light border border-primary/20">
            {testimonial.niche}
          </span>
        )}
      </div>
    </motion.div>
  );
}
