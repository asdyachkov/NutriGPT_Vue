/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2D6A4F', light: '#40916C', dark: '#1B4332' },
        accent: { DEFAULT: '#F4A261', light: '#F6BD7A', dark: '#E76F51' },
        danger: '#E63946',
        info: '#457B9D',
        surface: '#FFFFFF',
        'bg-alt': '#F8F9FA',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      maxWidth: {
        'app': '1200px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
