import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({ size = "md", showText = true, href = "/", className }: LogoProps) {
  const dims = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-12 h-12" };
  const textSize = { sm: "text-base", md: "text-lg", lg: "text-2xl" };

  const mark = (
    <div className={cn("relative flex-shrink-0", dims[size])}>
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md scale-110" />
      {/* Main mark */}
      <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-glow-primary overflow-hidden">
        {/* Inner grid pattern */}
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full absolute inset-0 opacity-10">
          <path d="M0 12h36M0 24h36M12 0v36M24 0v36" stroke="white" strokeWidth="0.5" />
        </svg>
        {/* FF monogram */}
        <svg viewBox="0 0 36 36" fill="none" className="w-[70%] h-[70%] relative z-10">
          {/* F left stroke */}
          <rect x="4" y="7" width="2.5" height="22" rx="1.25" fill="white" />
          {/* F top bar */}
          <rect x="4" y="7" width="11" height="2.5" rx="1.25" fill="white" />
          {/* F mid bar */}
          <rect x="4" y="15" width="8" height="2.5" rx="1.25" fill="white" />
          {/* F2 right stroke */}
          <rect x="19.5" y="7" width="2.5" height="22" rx="1.25" fill="white" fillOpacity="0.85" />
          {/* F2 top bar */}
          <rect x="19.5" y="7" width="11" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
          {/* F2 mid bar */}
          <rect x="19.5" y="15" width="8" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
        </svg>
      </div>
    </div>
  );

  const content = (
    <span className={cn("flex items-center gap-2.5 group", className)}>
      {mark}
      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground group-hover:text-primary-light transition-colors", textSize[size])}>
          Freelance<span className="text-primary-light">Flow</span>
        </span>
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
