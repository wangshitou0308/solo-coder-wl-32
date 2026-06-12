/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        primary: {
          50: "#eef3fa",
          100: "#d6e2f0",
          200: "#a9c1e0",
          300: "#7aa0cf",
          400: "#4d7fbe",
          500: "#2d5fa1",
          600: "#1e3a5f",
          700: "#18304f",
          800: "#12263f",
          900: "#0c1c2f",
        },
        accent: {
          50: "#fbf6ea",
          100: "#f5e9c8",
          200: "#ebd391",
          300: "#e1bd5a",
          400: "#d7a72c",
          500: "#c9a962",
          600: "#b08e46",
          700: "#8a6f37",
          800: "#645128",
          900: "#3e3219",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
