/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'fw-navy': '#154289',
        'fw-navy-dark': '#0e2f5e',
        'fw-red': '#B00001',
        'fw-red-dark': '#A40000',
        'fw-heading': '#1E293B',
        'fw-body': '#334155',
        'fw-green': '#38a169',
        'fw-orange': '#dd6b20',
      },
    },
  },
  plugins: [],
};
