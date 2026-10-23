/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          primary: '#ee4d2d',
          dark: '#d03b1c',
          light: '#f05d40',
          bg: '#f5f5f5',
          gold: '#f6a700',
        },
      },
    },
  },
  plugins: [],
}
