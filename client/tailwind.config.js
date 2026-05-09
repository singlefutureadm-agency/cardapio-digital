export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          light:   'var(--brand-light)',
          dark:    'var(--brand-dark)',
        },
        surface: 'var(--surface)',
        card:    'var(--card)',
        panel:   'var(--panel)',
        border:  'var(--border)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}