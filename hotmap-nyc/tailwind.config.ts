import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:    '#0C0C0C',
        'ink-2': '#141414',
        'ink-3': '#1C1C1C',
        'ink-4': '#282828',
        wire:   '#2E2E2E',
        'wire-2': '#3A3A3A',
        dim:    '#6B6B6B',
        mid:    '#9A9A9A',
        pale:   '#C8C8C8',
        ghost:  '#EBEBEB',
        snow:   '#F5F5F5',
        // Single accent — deep amber, never neon
        pulse: {
          DEFAULT: '#C8923A',
          dim:     '#9E6E27',
          bright:  '#E0A84A',
          muted:   '#C8923A1A',
        },
        // Live indicator — cool seafoam, not cyan
        live: {
          DEFAULT: '#4ECBA0',
          dim:     '#3A9B78',
          muted:   '#4ECBA015',
        },
        // Crowd spectrum
        crowd: {
          1: '#4ECBA0',
          2: '#82C87A',
          3: '#D4B85A',
          4: '#D4834A',
          5: '#C85050',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:    ['var(--font-instrument)', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        '2xl': '12px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'ping-ring': {
          '0%':    { transform: 'scale(1)', opacity: '0.6' },
          '100%':  { transform: 'scale(2.2)', opacity: '0' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.4s ease-out',
        'slide-up':   'slide-up 0.3s cubic-bezier(0.16,1,0.3,1)',
        'ping-ring':  'ping-ring 1.8s ease-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;