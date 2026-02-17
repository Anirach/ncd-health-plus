import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E8EBF0',
          100: '#C5CBD6',
          200: '#9EA8BA',
          300: '#77859E',
          400: '#596B89',
          500: '#3B5174',
          600: '#2F4366',
          700: '#233454',
          800: '#1B2A4A',
          900: '#0F1A30',
        },
        teal: {
          DEFAULT: '#0EA5E9',
          50: '#E6F6FE',
          100: '#BAEAFD',
          200: '#8BDBFB',
          300: '#5CCDF9',
          400: '#38C2F8',
          500: '#0EA5E9',
          600: '#0B8BC5',
          700: '#086FA0',
          800: '#06547A',
          900: '#033A55',
        },
        risk: {
          green: '#22C55E',
          yellow: '#EAB308',
          orange: '#F97316',
          red: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
