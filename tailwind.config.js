/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pmc: {
          primary: '#1a472a',
          secondary: '#2d5f3f',
          accent: '#4a9960',
          light: '#e8f5e9',
          dark: '#0d2818',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
