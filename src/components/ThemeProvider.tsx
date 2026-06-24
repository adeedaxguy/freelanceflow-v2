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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.classList.contains("light") ? "light" : "dark";
  });

  // Dark is the product default. Light only applies after the user explicitly chooses it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ff_theme");
      const initial: Theme = saved === "light" ? "light" : "dark";
      setThemeState(initial);
      applyTheme(initial);
    } catch {
      applyTheme("dark");
    }
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    if (t === "light") {
      root.classList.add("light");
    } else {
      root.classList.add("dark");
    }
    root.style.colorScheme = t;
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
