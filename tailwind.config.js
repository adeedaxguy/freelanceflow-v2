/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080810",
        surface: "#0F0F1A",
        border: "#1E1E3A",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#9F67FF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#00E5A0",
          foreground: "#080810",
        },
        gold: "#FFD166",
        foreground: "#F0F0FF",
        muted: {
          DEFAULT: "#1E1E3A",
          foreground: "#8888AA",
        },
        card: {
          DEFAULT: "#0F0F1A",
          foreground: "#F0F0FF",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        ring: "#7C3AED",
        input: "#1E1E3A",
        popover: {
          DEFAULT: "#0F0F1A",
          foreground: "#F0F0FF",
        },
        secondary: {
          DEFAULT: "#1E1E3A",
          foreground: "#F0F0FF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #7C3AED 0%, #00E5A0 100%)",
        "gradient-card": "linear-gradient(145deg, #0F0F1A, #1A1A2E)",
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
        "gradient-shift": "gradient-shift 3s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
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
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};
