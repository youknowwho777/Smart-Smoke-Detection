/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        iot: {
          darkBg: '#0b1120',
          darkCard: '#111827',
          darkBorder: '#1f2937',
          sidebar: '#0d1527',
          sidebarActive: '#1d4ed8'
        }
      }
    },
  },
  plugins: [],
}
