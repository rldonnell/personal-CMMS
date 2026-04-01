/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'fw-blue': '#1e3a5f',
        'fw-blue-light': '#2c5282',
        'fw-gold': '#d4a843',
        'fw-green': '#38a169',
        'fw-orange': '#dd6b20',
        'fw-red': '#e53e3e',
      },
    },
  },
  plugins: [],
};
