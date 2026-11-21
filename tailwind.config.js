/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          black: '#02040A',
          deep: '#030B1C',
          navy: '#071A35',
          nebula: '#0879D1',
          electric: '#168BFF',
          cyan: '#27DFFF',
          text: '#F1F5F9',
          textMuted: '#CBD5E1',
          border: 'rgba(22, 139, 255, 0.25)',
          card: 'rgba(2, 8, 24, 0.88)',
        }
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(39, 223, 255, 0.25)',
        'glow-md': '0 0 25px rgba(22, 139, 255, 0.35)',
        'glow-lg': '0 0 45px rgba(39, 223, 255, 0.45)',
        'glow-cyan': '0 0 30px rgba(39, 223, 255, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(22, 139, 255, 0.2)',
        'glass-hover': '0 12px 40px 0 rgba(22, 139, 255, 0.25), inset 0 0 0 1px rgba(39, 223, 255, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'nebula-gradient': 'radial-gradient(circle at 50% 50%, rgba(22, 139, 255, 0.15), rgba(8, 121, 209, 0.08) 50%, transparent 80%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
