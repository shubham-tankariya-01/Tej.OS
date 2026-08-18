/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-black':       '#131313',
        'card-coral':     '#F2694A',
        'card-periwinkle':'#7C80EE',
        'card-mustard':   '#EEB63C',
        'card-mint':      '#D3DFC9',
        'card-cyan':      '#C3E4EC',
        'surface-white':  '#F7F7F5',
        'text-on-dark':   '#F2F2EF',
        'text-on-color':  '#131313',
        'text-muted':     '#9A9A94',
      },
      fontFamily: {
        // Single-family system as per ui.md §2 — Space Grotesk for everything,
        // weight-based hierarchy only (no display/body split).
        sans:    ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'stat': ['48px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'title': ['22px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      borderRadius: {
        'card':    '32px',
        'card-sm': '24px',
        'pill':    '9999px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(0,0,0,0.08)',
        'none': 'none',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-bottom': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':          'fade-in 0.25s ease-out forwards',
        'slide-in-bottom':  'slide-in-bottom 0.3s ease-out forwards',
        'scale-in':         'scale-in 0.2s ease-out forwards',
        'shimmer':          'shimmer 1.8s infinite linear',
      },
    },
  },
  plugins: [],
}
