/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0F2A5C', dark: '#0A1F47' },
        navy: '#0F2A5C',
        saffron: { DEFAULT: '#F97316', dark: '#EA580C' },
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(15,42,92,.08)',
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
    },
  },
  plugins: [],
};
