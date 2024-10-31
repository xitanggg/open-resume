/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',  // Enable dark mode via class
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Include all necessary files for Tailwind to scan for classes
  ],
  theme: {
    extend: {
      backgroundImage: {
        dot: "url('/assets/dots.svg')",  // Optional: if you're using a custom background image
      },
    },
  },
  corePlugins: {
    aspectRatio: false,  // Optional: you can remove if you're not using this
  },
  plugins: [
    require("tailwind-scrollbar")({ nocompatible: true }),
    require("@tailwindcss/aspect-ratio"),  // Optional: other Tailwind plugins you may be using
  ],
};
