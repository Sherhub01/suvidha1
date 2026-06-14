/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1a1a2e",
          light: "#2d2d44",
          50: "#f0f0f5",
        },
        marigold: {
          DEFAULT: "#f5a623",
          light: "#fef3dc",
          dark: "#c47d0e",
        },
        sand: "#faf8f4",
        rust: {
          DEFAULT: "#e05a2b",
          light: "#fdf0eb",
        },
        teal: {
          DEFAULT: "#0d9488",
          light: "#e0f7f5",
        },
        stone: {
          muted: "#9ca3af",
        },
      },
      borderRadius: {
        xl2: "1rem",
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(0,0,0,0.06), 0 2px 8px 0 rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px 0 rgba(0,0,0,0.10)",
        stamp: "0 2px 8px 0 rgba(0,0,0,0.18)",
      },
      backgroundImage: {
        "hero-mesh":
          "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #3b2f6e 100%)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
