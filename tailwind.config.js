// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'netflix-red': '#E50914',
        'netflix-black': '#0a0a0a',
        'netflix-dark': '#121212',
        'netflix-gray': '#6b7280',
        'accent-purple': '#8b5cf6',
        'accent-blue': '#3b82f6',
        'accent-cyan': '#06b6d4',
        'accent-pink': '#ec4899',
        'accent-orange': '#f97316',
      },
      fontFamily: {
        sans: ['Outfit', 'Space Grotesk', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'code-scroll': 'code-scroll 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
        'blur-in': 'blur-in 0.8s ease-out forwards',
        'slide-up': 'slide-up-fade 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
      },
      keyframes: {
        'code-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(229, 9, 20, 0.4), 0 0 40px rgba(229, 9, 20, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(229, 9, 20, 0.6), 0 0 60px rgba(229, 9, 20, 0.3)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'blur-in': {
          '0%': { filter: 'blur(10px)', opacity: '0' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
        'slide-up-fade': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-fire': 'linear-gradient(135deg, #f97316 0%, #E50914 50%, #dc2626 100%)',
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(229, 9, 20, 0.5), 0 0 40px rgba(229, 9, 20, 0.3)',
        'glow-lg': '0 0 30px rgba(229, 9, 20, 0.6), 0 0 60px rgba(229, 9, 20, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}