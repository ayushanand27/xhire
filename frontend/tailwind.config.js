/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // App theme tokens
        background: '#0b0f14',
        foreground: '#f3f6f9',
        muted: '#11161b',
        'muted-foreground': '#9aa7b2',
        border: '#1c242d',
        primary: '#22c55e',
        'primary-foreground': '#052e16',
      },
      fontSize: {
        // Slightly opinionated SaaS scale
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.7rem' }],
        xl: ['1.25rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '12px',
        lg: '14px',
        xl: '18px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.08)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.15)',
        md: '0 6px 16px rgba(0,0,0,0.18)',
        lg: '0 12px 28px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
};
