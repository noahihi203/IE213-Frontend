/** @type {import('tailwindcss').Config} */
// tailwind.config.js
plugins: [require("@tailwindcss/typography")];
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        "accent-orange": {
          50: "#E9E1D1",
          100: "#E9DABA",
          200: "#EACB8B",
          300: "#EBBC5D",
          400: "#ECAD2E",
          500: "#ED9F00",
          600: "#BE7F00",
          700: "#8E5F00",
          800: "#5F4000",
          900: "#2F2000",
          950: "#1A1100",
        },
        "accent-blue": {
          50: "#D1DEE6",
          100: "#BAD5E2",
          200: "#8BC1DD",
          300: "#5DAED9",
          400: "#2E9AD3",
          500: "#0087CE",
          600: "#006CA5",
          700: "#00517C",
          800: "#003652",
          900: "#001B29",
          950: "#000F17",
        },
        "accent-pink": {
          50: "#E7D1D9",
          100: "#E6BACB",
          200: "#E38BAD",
          300: "#E15D90",
          400: "#DE2E72",
          500: "#DC0055",
          600: "#B00044",
          700: "#840033",
          800: "#580022",
          900: "#2C0011",
          950: "#180009",
        },
      },
    },
  },
  plugins: [],
};
