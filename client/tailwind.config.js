/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bms: ['"Plus Jakarta Sans"', '"Inter"', '"Roboto"', 'sans-serif'],
        luxury: ['"Playfair Display"', '"Cinzel"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        serif: ['"Playfair Display"', '"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', '"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        bms: {
          red: '#F84464',
          'red-hover': '#E03252',
          'red-dark': '#D62747',
          header: '#333545',
          subnav: '#1F2533',
          footer: '#333545',
          'footer-dark': '#222433',
          bg: '#F5F5FA',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#222222',
          muted: '#666666',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E8',
          200: '#F4E4C4',
          300: '#EBD19A',
          400: '#E2BD70',
          500: '#D4AF37',
          600: '#B89228',
          700: '#94721C',
          800: '#715413',
          900: '#4E380A',
        },
      },
      boxShadow: {
        'bms-card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'bms-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'gold-glow': '0 0 25px rgba(229, 169, 60, 0.25)',
        'gold-glow-lg': '0 0 45px rgba(229, 169, 60, 0.4)',
      }
    },
  },
  plugins: [],
};
