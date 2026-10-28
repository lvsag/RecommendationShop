/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in': { from: { transform: 'translateX(16px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
      },
      animation: { 'slide-in': 'slide-in 0.25s ease-out' },
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
