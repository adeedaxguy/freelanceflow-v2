"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface Props {
  className?: string;
  size?: "sm" | "md";
}

export default function ThemeToggle({ className = "", size = "md" }: Props) {
  const { theme, toggle } = useTheme();

  const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={`${dim} flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/25 hover:bg-secondary transition-colors flex-shrink-0 ${className}`}
    >
      {theme === "dark"
        ? <Sun className={icon} />
        : <Moon className={icon} />
      }
    </button>
  );
}
