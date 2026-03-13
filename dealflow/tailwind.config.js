/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#08090c',
          card: '#13151c',
          elevated: '#1c1e28',
          border: 'rgba(255,255,255,0.06)',
          'border-hover': 'rgba(255,255,255,0.12)',
          text: '#a8a6b4',
          'text-dim': '#5e5d6a',
          'text-bright': '#f0eef5',
          accent: '#2563EB',
          'accent-light': '#3b82f6',
          'accent-dim': 'rgba(37,99,235,0.12)',
          gold: '#c8a55a',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
