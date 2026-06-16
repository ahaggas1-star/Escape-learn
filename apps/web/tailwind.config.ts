import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // هوية فرائحية مرحة موجّهة للطفل (OWNER_DECISIONS #14) — مبدئية
        ghars: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22a06b",
          600: "#16855a",
          700: "#116245",
          900: "#0a3b2b",
        },
        // ألوان مبهجة للأطفال (تمييز، شارات، احتفال)
        joy: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fbbf24",
          500: "#f59e0b",
        },
        sky: {
          100: "#e0f2fe",
          500: "#0ea5e9",
        },
        bloom: {
          100: "#fce7f3",
          500: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Tahoma", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
