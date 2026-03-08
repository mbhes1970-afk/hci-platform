/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          'primary-light': 'var(--color-primary-light)',
          'primary-dim': 'var(--color-primary-dim)',
          accent: 'var(--color-accent)',
          bg: 'var(--color-bg)',
          'bg-card': 'var(--color-bg-card)',
          'bg-elevated': 'var(--color-bg-elevated)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          'text-dim': 'var(--color-text-dim)',
          'text-bright': 'var(--color-text-bright)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
