"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type AnimatedContentProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  amount?: number;
  blur?: number;
  scale?: number;
};

export default function AnimatedContent({
  children,
  className,
  delay = 0,
  distance = 24,
  direction = "vertical",
  reverse = false,
  duration = 0.55,
  amount = 0.2,
  blur = 0,
  scale = 1,
}: AnimatedContentProps) {
  const reduceMotion = useReducedMotion();
  const offset = (reverse ? -1 : 1) * distance;
  const hidden = direction === "horizontal"
    ? { opacity: 0, x: offset, filter: `blur(${blur}px)`, scale }
    : { opacity: 0, y: offset, filter: `blur(${blur}px)`, scale };

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : hidden}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
