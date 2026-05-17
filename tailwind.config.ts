import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-display)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        accent: {
          DEFAULT: "#3D9587",
          light: "#4db3a3",
          dark: "#2d7568",
          50: "#f0faf8",
          100: "#d4f0eb",
          200: "#a8e1d7",
          300: "#6fcbbe",
          400: "#4db3a3",
          500: "#3D9587",
          600: "#317a6e",
          700: "#285f56",
          800: "#1f4a43",
          900: "#173835",
        },
      },
    },
  },
  plugins: [],
};
export default config;
