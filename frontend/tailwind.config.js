/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        border: {
          subtle: 'var(--border-subtle)',
          active: 'var(--border-active)',
        },
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        accent: {
          cyan: 'var(--accent-cyan)',
          mint: 'var(--accent-mint)',
          amber: 'var(--accent-amber)',
          coral: 'var(--accent-coral)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        tactile: 'var(--shadow-tactile)',
        'tactile-hover': 'var(--shadow-tactile-hover)',
      }
    },
  },
  plugins: [],
}
