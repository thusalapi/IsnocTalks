import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './constants/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
      },
      colors: {
        // Esports dark + neon design tokens
        bg: '#07070D',
        surface: { DEFAULT: '#0E0E18', 2: '#151524', 3: '#1D1D31' },
        line: { DEFAULT: '#25253C', strong: '#34345A' },
        ink: { DEFAULT: '#ECECF6', soft: '#C4C6DA', muted: '#8C8FAB', faint: '#5E6080' },
        primary: { DEFAULT: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9', soft: '#8B5CF61F' },
        accent: { DEFAULT: '#22D3EE', soft: '#22D3EE1A' },
        success: '#34D399',
        danger: '#F43F5E',
        warn: '#FBBF24',
        // Legacy names kept so older classes map onto the new palette
        dark: { 1: '#0E0E18', 2: '#07070D', 3: '#151524', 4: '#1D1D31' },
        blue: { 1: '#7C3AED' },
        sky: { 1: '#8C8FAB', 2: '#C4C6DA', 3: '#ECECF6' },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.35), 0 10px 40px -10px rgba(139,92,246,0.55)',
        'glow-cyan': '0 0 0 1px rgba(34,211,238,0.35), 0 10px 40px -12px rgba(34,211,238,0.5)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 45%, #22D3EE 100%)',
        'text-gradient': 'linear-gradient(90deg, #C4B5FD 0%, #8B5CF6 40%, #22D3EE 100%)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-ring': { '0%': { transform: 'scale(0.9)', opacity: '0.7' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        dash: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        float: 'float 5s ease-in-out infinite',
        dash: 'dash 1.6s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
