/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          green: '#2d5016',
          light: '#3a6b1f',
          line: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
