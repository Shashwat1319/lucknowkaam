import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#1A1A2E",
        background: "#F8F9FA",
        card: "#FFFFFF",
        "text-primary": "#1A1A2E",
        "text-secondary": "#6B7280",
        success: "#10B981",
        border: "#E5E7EB",
      },
      fontFamily: {
        hindi: ["'Noto Sans Devanagari'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
