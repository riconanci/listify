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
        // Darker, more professional theme matching your prototype
        background: 'hsl(210 11% 15%)',        // Very dark gray
        foreground: 'hsl(213 31% 91%)',        // Light gray text
        primary: {
          DEFAULT: 'hsl(200 100% 50%)',         // Bright blue
          foreground: 'hsl(0 0% 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 11% 20%)',          // Slightly lighter than background
          foreground: 'hsl(213 31% 91%)',
        },
        muted: {
          DEFAULT: 'hsl(210 11% 12%)',          // Even darker
          foreground: 'hsl(213 31% 70%)',       // Muted text
        },
        border: 'hsl(210 11% 25%)',             // Subtle borders
        input: 'hsl(210 11% 18%)',              // Dark input backgrounds
        card: {
          DEFAULT: 'hsl(210 11% 17%)',          // Card backgrounds
          foreground: 'hsl(213 31% 91%)',
        },
        accent: {
          DEFAULT: 'hsl(210 11% 22%)',          // Accent elements
          foreground: 'hsl(213 31% 91%)',
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