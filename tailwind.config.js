/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#8A99B3',
          300: '#4F668D',
          400: '#2A4066',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070919',
        },
        accent: {
          50: '#FEF3EB',
          100: '#FDDCCC',
          200: '#FBB999',
          300: '#F89666',
          400: '#E8763A',
          500: '#D4611F',
          600: '#A84C18',
          700: '#7C3812',
          800: '#51250C',
          900: '#261206',
        },
        surface: {
          50: '#F0F4F8',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#64748B',
        },
        success: '#2ECC71',
        danger: '#E74C3C',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
