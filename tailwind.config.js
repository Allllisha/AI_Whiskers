/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'whisky': {
          50: '#fdf8f3',
          100: '#f9ede0',
          200: '#f2d9b8',
          300: '#e8b888',
          400: '#db8f56',
          500: '#d07337',
          600: '#c15e2c',
          700: '#a04826',
          800: '#813c25',
          900: '#6a3322',
          950: '#391710',
        },
        'dark': {
          50: '#f6f6f7',
          100: '#e1e3e5',
          200: '#c3c6cb',
          300: '#9ea2aa',
          400: '#787e88',
          500: '#5e636e',
          600: '#4a4e57',
          700: '#3d4047',
          800: '#34363c',
          900: '#2e3034',
          950: '#1a1b1e',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-whisky': 'linear-gradient(135deg, #1a1b1e 0%, #2e3034 50%, #391710 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}