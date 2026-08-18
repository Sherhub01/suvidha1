/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./main.jsx",
    "./App.jsx",
    // One entry per top-level role folder, plus the shared layers.
    "./consumer/**/*.{js,jsx}",
    "./staff/**/*.{js,jsx}",
    "./admin/**/*.{js,jsx}",
    "./auth/**/*.{js,jsx}",
    "./shared/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          light:   "#1E293B",
        },
        gold: {
          DEFAULT:  "#F59E0B",
          dark:     "#B45309",
          light:    "#FEF3C7",
        },
        slate: {
          DEFAULT: "#64748B",
        },
        emerald: {
          DEFAULT: "#10B981",
        },
        rose: {
          DEFAULT:  "#F43F5E",
          light:    "#FFF1F2",
        },
      },
      boxShadow: {
        card:       "0 1px 4px 0 rgba(0,0,0,0.06), 0 2px 8px 0 rgba(0,0,0,0.04)",
        "card-hover":"0 4px 16px 0 rgba(0,0,0,0.10)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
