/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f8f2",
          100: "#dcefe1",
          500: "#28774d",
          700: "#145335",
          900: "#053B2A",
          950: "#092E22"
        },
        earth: {
          50: "#faf8f1",
          100: "#ede6d2",
          500: "#9c7a35"
        },
        ink: "#092E22",
        mint: "#DDEFE5",
        "food-yellow": "#F7D774",
        warning: "#F5B84B",
        danger: "#D65A4A",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(16, 48, 32, 0.12)"
      }
    },
  },
  plugins: [],
};
