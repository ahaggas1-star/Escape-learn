import type { Config } from "tailwindcss";

// =============================================================================
// نظام تصميم «قِيَم» — هوية «سمو» البصرية
// اللون الأساسي: أرجواني/بنفسجي راقٍ (شجرة سمو) · لمسات مرحة من نقاط الشجرة
// (برتقالي · فيروزي · أخضر · وردي/أرجواني) · خلفيات بيضاء وحدود رقيقة
// انظر docs/DESIGN_SYSTEM.md
// =============================================================================
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // اللون الأساسي: أرجواني سمو (مهيب، راقٍ)
        ghars: {
          50: "#f7f5f9",
          100: "#eee9f2",
          200: "#ddd4e6",
          300: "#c4b6d2",
          400: "#a892bb",
          500: "#87709d",
          600: "#5f4b76",
          700: "#4d3d60",
          800: "#3f3350",
          900: "#342942",
        },
        // لمسات مرحة مستوحاة من نقاط شجرة سمو
        joy: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c" },
        sky: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0e7490" },
        bloom: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#be1e6c" },
        grape: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" },
        leaf: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a" },
        // محايدات للحدود والأسطح
        line: "#e9e6ef",
      },
      fontFamily: {
        display: ['"IBM Plex Sans Arabic"', '"Tajawal"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans Arabic"', '"Tajawal"', "system-ui", "Tahoma", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        soft: "0 4px 16px -6px rgba(52,41,66,0.14)",
        pop: "0 6px 20px -8px rgba(52,41,66,0.20)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
        pop: { "0%": { transform: "scale(0.96)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pop: "pop 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
