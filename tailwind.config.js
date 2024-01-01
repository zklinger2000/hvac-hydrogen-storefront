import daisyuiPlugin from 'daisyui';
import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        squada: ['Squada One', 'sans-serif'],
      },
    },
  },
  plugins: [formsPlugin, typographyPlugin, daisyuiPlugin],
  daisyui: {
    themes: ['nord'],
    logs: process.env.NODE_ENV !== 'production',
  },
};