/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0f172a",
          soft: "#1e293b",
        },
        primary: {
          DEFAULT: "#3b82f6",
          soft: "#38bdf8",
        }
      }
    },
  },
  plugins: [],
};

