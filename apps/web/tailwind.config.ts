import type { Config } from "tailwindcss";

// =============================================================================
// نظام تصميم «قِيَم» — هوية نظيفة عصرية احترافية (إحساس المنصات الحكومية السعودية)
// خلفيات بيضاء · لون أساسي مهيب · حدود رقيقة · خطوط واضحة (IBM Plex Sans Arabic)
// انظر docs/DESIGN_SYSTEM.md
// =============================================================================
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // اللون الأساسي: أخضر مخضرّ مهيب (احترافي، هادئ)
        ghars: {
          50: "#f0f9f6",
          100: "#d9f0e8",
          200: "#b4e1d2",
          300: "#84cdb7",
          400: "#4fb097",
          500: "#2a9079",
          600: "#1f7360",
          700: "#1b5b4d",
          800: "#184940",
          900: "#123a34",
        },
        // حالات/تمييز هادئة
        joy: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
        sky: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb" },
        bloom: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 400: "#f472b6", 500: "#ec4899", 600: "#db2777" },
        grape: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" },
        // محايدات للحدود والأسطح
        line: "#e6eaef",
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
        soft: "0 4px 16px -6px rgba(18,58,52,0.12)",
        pop: "0 6px 20px -8px rgba(18,58,52,0.18)",
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
