/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-primary', 'hover:bg-primary-dark', 'focus:ring-primary-light', 'hover:shadow-primary/40',
    'bg-red-600', 'hover:bg-red-700', 'hover:shadow-red-500/40', 'focus:ring-red-500',
    'bg-amber-100', 'hover:bg-amber-200', 'text-amber-600', 'focus:ring-amber-500',
    'bg-gray-200', 'hover:bg-gray-300', 'text-gray-700', 'focus:ring-gray-400',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#00A6F4',
        'primary-dark': '#0084D1',
        'primary-light': '#00BCFF',
      },
      width: {
        68: '17rem',
      },
    },
  },
  plugins: [],
}