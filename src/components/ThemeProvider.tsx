"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ff_theme") as Theme | null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial: Theme = saved ?? (prefersDark ? "dark" : "light");
      setThemeState(initial);
      applyTheme(initial);
    } catch {}
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }

  function setTheme(t: Theme) {
    setThemeState(t);
    applyTheme(t);
    try { localStorage.setItem("ff_theme", t); } catch {}
  }

  function toggle() { setTheme(theme === "dark" ? "light" : "dark"); }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
