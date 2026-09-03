"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type CountUpProps = {
  to: number;
  from?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

export default function CountUp({
  to,
  from = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  duration = 1.4,
  delay = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const value = useMotionValue(from);
  const spring = useSpring(value, {
    damping: 20 + 40 / duration,
    stiffness: 100 / duration,
  });

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      value.jump(to);
      return;
    }

    const timeout = window.setTimeout(() => value.set(to), delay * 1000);
    return () => window.clearTimeout(timeout);
  }, [delay, inView, reduceMotion, to, value]);

  useEffect(() => {
    const format = (latest: number) => {
      const rounded = Math.round(latest);
      const formatted = separator
        ? new Intl.NumberFormat("en-US").format(rounded).replace(/,/g, separator)
        : String(rounded);
      if (ref.current) ref.current.textContent = `${prefix}${formatted}${suffix}`;
    };

    format(reduceMotion ? to : from);
    return spring.on("change", format);
  }, [from, prefix, reduceMotion, separator, spring, suffix, to]);

  return <span ref={ref} className={className} />;
}
