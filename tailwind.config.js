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
        // Dark theme matching your prototype
        background: 'hsl(220 13% 13%)',
        foreground: 'hsl(220 9% 89%)',
        primary: {
          DEFAULT: 'hsl(200 98% 39%)',
          foreground: 'hsl(0 0% 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(220 13% 18%)',
          foreground: 'hsl(220 9% 89%)',
        },
        muted: {
          DEFAULT: 'hsl(220 13% 16%)',
          foreground: 'hsl(220 9% 60%)',
        },
        border: 'hsl(220 13% 20%)',
        input: 'hsl(220 13% 18%)',
        card: {
          DEFAULT: 'hsl(220 13% 16%)',
          foreground: 'hsl(220 9% 89%)',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}