/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          300: '#7cc1fa',
          400: '#36a1f5',
          500: '#0c85e6',
          600: '#0067c2',
          700: '#01529d',
          800: '#064682',
          900: '#0b3b6d',
          950: '#072648',
        },
        fuel: {
          dark: '#0f172a',
          surface: '#1e293b',
          accent: '#2563eb',
          subtle: '#f8fafc',
          border: '#e2e8f0',
        }
      }
    },
  },
  plugins: [],
}
