import type { Config } from "tailwindcss";

// =============================================================================
// نظام تصميم «قِيَم» — هوية فرائحية مرحة موجّهة للطفل
// انظر docs/DESIGN_SYSTEM.md
// =============================================================================
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // اللون الأساسي: النمو والغرس (أخضر مبهج)
        ghars: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // ألوان مرحة مساندة
        joy: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
        sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7" },
        bloom: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 400: "#f472b6", 500: "#ec4899", 600: "#db2777" },
        grape: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea" },
      },
      fontFamily: {
        display: ['"Baloo Bhaijaan 2"', '"Tajawal"', "system-ui", "sans-serif"],
        sans: ['"Tajawal"', "system-ui", "Tahoma", "Arial", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 12px 32px -14px rgba(22,134,74,0.22)",
        card: "0 4px 20px -8px rgba(20,83,45,0.12)",
        pop: "0 8px 0 -2px rgba(22,134,74,0.18)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        pop: { "0%": { transform: "scale(0.9)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        wiggle: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
      },
      animation: {
        float: "float 3.5s ease-in-out infinite",
        pop: "pop 0.25s ease-out",
        wiggle: "wiggle 0.8s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
