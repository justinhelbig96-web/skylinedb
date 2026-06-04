import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jdm: {
          bg:         '#08080f',
          surface:    '#0f0f1b',
          card:       '#121220',
          border:     '#1e1e36',
          red:        '#cc0022',
          'red-bright': '#ff1a35',
          'red-dark': '#800015',
          gold:       '#c9a227',
          text:       '#e8e8f8',
          muted:      '#6b6b9a',
          silver:     '#c0c0d0',
          blue:       '#0088ff',
          green:      '#00bb55',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'Impact', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(204,0,34,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(204,0,34,0.8), 0 0 40px rgba(204,0,34,0.3)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
