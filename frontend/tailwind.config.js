/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B14',
          900: '#0B132B',
          850: '#111D3E',
          800: '#1C2541',
          700: '#2A3656',
          600: '#3A4B75',
        },
        cyber: {
          blue: '#00F0FF',
          darkBlue: '#0072B2',
          cyan: '#38BDF8',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          violet: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}

