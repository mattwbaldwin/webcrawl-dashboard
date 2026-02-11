/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          brand: '#C17F24',
          light: '#FDF4E7',
          border: '#f0dfc0',
        }
      },
    },
  },
  plugins: [],
}
