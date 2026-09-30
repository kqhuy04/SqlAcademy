/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          parchment: '#F5ECD7',
          paper: '#EDE3C9',
          paperLight: '#FAF6EC',
          card: '#E5D9BC',
          cardHover: '#DDD0B0',
          border: '#C4B6A0',
          borderDark: '#9A8870',
          ink: '#1A1612',
          inkMuted: '#4A3E30',
          inkFaint: '#685947',
          blood: '#8B1A1A',
          bloodDark: '#6D1212',
          bloodLight: '#A82828',
          candle: '#C9972C',
          candleDark: '#A67818',
          candleLight: '#E8BA4F',
          stamp: '#2A4B2A',
          stampLight: '#3B6B3B',
          gold: '#DFAB3A',
          shadow: '#3A2F22',
        },
      },
      fontFamily: {
        display: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
        typewriter: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'noir-xs': '0 1px 2px rgba(35, 25, 15, 0.06)',
        'noir-sm': '0 1px 3px rgba(35, 25, 15, 0.08)',
        'noir-card': '0 4px 14px rgba(35, 25, 15, 0.1), 0 1px 3px rgba(35, 25, 15, 0.06)',
        'noir-md': '0 6px 18px -2px rgba(35, 25, 15, 0.14), 0 2px 6px -1px rgba(35, 25, 15, 0.08)',
        'noir-lift': '0 12px 28px -4px rgba(35, 25, 15, 0.18), 0 6px 12px -4px rgba(35, 25, 15, 0.12)',
        'noir-lg': '0 16px 36px -6px rgba(35, 25, 15, 0.22), 0 8px 16px -4px rgba(35, 25, 15, 0.12)',
        'noir-modal': '0 20px 44px -8px rgba(35, 25, 15, 0.28), 0 8px 20px -4px rgba(35, 25, 15, 0.16)',
        'glow-gold': '0 0 20px -3px rgba(201, 151, 44, 0.35)',
        'glow-blood': '0 0 20px -3px rgba(139, 26, 26, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(112, 66, 20, 0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

