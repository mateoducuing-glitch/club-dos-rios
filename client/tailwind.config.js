/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        verde: {
          50:  '#f0f7f3',
          100: '#d8ede2',
          200: '#b3dbc7',
          300: '#81c2a3',
          400: '#4da37b',
          500: '#2d845e',
          600: '#1f6849',
          700: '#1a3a2a',
          800: '#152e22',
          900: '#10231a',
        },
        dorado: {
          50:  '#fdf8ee',
          100: '#f9edcc',
          200: '#f3d98a',
          300: '#ecc44a',
          400: '#e5ae1e',
          500: '#c9920f',
          600: '#a8720b',
          700: '#875509',
          800: '#6b4009',
          900: '#572f0a',
        },
        crema: '#f8f4ef',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(26,58,42,0.10)',
        'card-hover': '0 8px 32px rgba(26,58,42,0.18)',
      },
    },
  },
  plugins: [],
}
