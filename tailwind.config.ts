import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090915",
        surface: "#10102A",
        border: "#20204A",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#9F67FF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#00E5A0",
          foreground: "#090915",
        },
        gold: "#FFD166",
        foreground: "#F2F2FF",
        muted: {
          DEFAULT: "#20204A",
          foreground: "#9090B8",
        },
        card: {
          DEFAULT: "#10102A",
          foreground: "#F2F2FF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        ring: "#7C3AED",
        input: "#20204A",
        popover: {
          DEFAULT: "#10102A",
          foreground: "#F2F2FF",
        },
        secondary: {
          DEFAULT: "#20204A",
          foreground: "#F2F2FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["72px", { lineHeight: "1.1", letterSpacing: "-2px", fontWeight: "700" }],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #7C3AED 0%, #00E5A0 100%)",
        "gradient-card": "linear-gradient(145deg, #10102A, #181840)",
        "gradient-card-hover": "linear-gradient(145deg, #14143A, #1E1E50)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "dot-pattern": "radial-gradient(circle, #1E1E3A 1px, transparent 1px)",
        "grid-pattern": "linear-gradient(#1E1E3A 1px, transparent 1px), linear-gradient(to right, #1E1E3A 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-sm": "20px 20px",
        "grid-sm": "40px 40px",
      },
      boxShadow: {
        "glow-primary": "0 0 30px rgba(124,58,237,0.4)",
        "glow-accent": "0 0 30px rgba(0,229,160,0.3)",
        "glow-gold": "0 0 20px rgba(255,209,102,0.3)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.5)",
      },
      animation: {
        "gradient-shift":  "gradient-shift 3s ease infinite",
        "float":           "float 6s ease-in-out infinite",
        "pulse-glow":      "pulse-glow 2s ease-in-out infinite",
        "fade-in-up":      "fade-in-up 0.5s ease-out",
        "slide-in-right":  "slide-in-right 0.3s ease-out",
        "slide-in-left":   "slide-in-left 0.3s ease-out",
        "scale-in":        "scale-in 0.2s ease-out",
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "skeleton":        "skeleton-shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.7)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "skeleton-shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
