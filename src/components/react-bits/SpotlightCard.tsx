"use client";

import type { CSSProperties, PointerEvent, PropsWithChildren } from "react";
import { useRef } from "react";

type SpotlightCardProps = PropsWithChildren<{
  className?: string;
  spotlightColor?: string;
}>;

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "hsl(var(--primary) / 0.14)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const moveSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  const spotlightStyle = {
    "--spotlight-color": spotlightColor,
  } as CSSProperties;

  return (
    <div
      ref={cardRef}
      className={`react-bits-spotlight relative overflow-hidden ${className}`}
      style={spotlightStyle}
      onPointerMove={moveSpotlight}
    >
      <span className="react-bits-spotlight-layer" aria-hidden="true" />
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
