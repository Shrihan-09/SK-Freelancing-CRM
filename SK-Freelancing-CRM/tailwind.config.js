/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        dark: {
          950: '#030303',
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#222222',
          500: '#2d2d2d',
          400: '#3a3a3a',
          300: '#4a4a4a',
          200: '#666666',
          100: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(225, 29, 72, 0.3), 0 0 20px rgba(225, 29, 72, 0.1)' },
          '50%': { boxShadow: '0 0 10px rgba(225, 29, 72, 0.5), 0 0 40px rgba(225, 29, 72, 0.2)' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(225, 29, 72, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(225, 29, 72, 0.03) 1px, transparent 1px)',
        'crimson-glow': 'radial-gradient(ellipse at center, rgba(225, 29, 72, 0.15) 0%, transparent 70%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'crimson': '0 0 15px rgba(225, 29, 72, 0.3)',
        'crimson-lg': '0 0 30px rgba(225, 29, 72, 0.4)',
        'glow': '0 0 0 1px rgba(225, 29, 72, 0.3), 0 0 20px rgba(225, 29, 72, 0.1)',
        'glass': 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 1px 0 0 rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
