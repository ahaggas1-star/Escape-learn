import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ثيمة مؤقتة — لا هوية بصرية معتمدة بعد (OWNER_DECISIONS #14)
        ghars: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22a06b",
          600: "#16855a",
          700: "#116245",
          900: "#0a3b2b",
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
