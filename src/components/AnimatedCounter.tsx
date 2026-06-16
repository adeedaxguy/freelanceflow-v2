"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1400,
}: Props) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const start = Date.now();

    function step() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </>
  );
}
