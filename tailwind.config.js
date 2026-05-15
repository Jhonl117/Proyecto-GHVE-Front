/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4bafc',
          400: '#7b93f8',
          500: '#5a6cf2',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        sidebar: {
          light: '#f8faff',
          DEFAULT: '#f0f4ff',
          dark: '#e0e9ff',
          accent: '#4f46e5',
        }
      },
    },
  },
  plugins: [],
}
