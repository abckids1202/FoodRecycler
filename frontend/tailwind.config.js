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
          900: "#0b2f20"
        },
        earth: {
          50: "#faf8f1",
          100: "#ede6d2",
          500: "#9c7a35"
        },
        ink: "#17211c"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(16, 48, 32, 0.12)"
      }
    },
  },
  plugins: [],
};
