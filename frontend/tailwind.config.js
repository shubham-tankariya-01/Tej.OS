/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-black': '#131313',
        'card-coral': '#F2694A',
        'card-periwinkle': '#7C80EE',
        'card-mustard': '#EEB63C',
        'card-mint': '#D3DFC9',
        'card-cyan': '#C3E4EC',
        'surface-white': '#F7F7F5',
        'text-on-dark': '#F2F2EF',
        'text-on-color': '#131313',
        'text-muted': '#9A9A94',
      },
      fontFamily: {
        display: ['Epilogue', 'sans-serif'],
        accent: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        extra: ['"Open Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '32px',
        'card-sm': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
