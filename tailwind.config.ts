/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rose-tan': '#D4A574',
        'rose-tan-light': '#E6BF94',
        'rose-tan-dark': '#B8956B',
        'mauve-wine': '#6B4C57',
        'mauve-wine-light': '#8B6B77',
        'mauve-wine-dark': '#4A3440',
        'luxury-cream': '#FAF7F4',
        'luxury-gold': '#D4AF37',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
