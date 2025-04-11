/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
          custom: ['ibrand', 'sans-serif'],
          inter: ['var(--font-inter)'],
      },
      colors:{
       brand:{
        logo_green: '#016e1b',
        btn_orange: '#f69f1b',
        sub_gray:"#7F7D7D"
       }
      },
      keyframes: {
        floating: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        spinning: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'floating 3s ease-in-out infinite',
        spinSlow: 'spinning 5s linear infinite',
      },
     
    },
  },
  plugins: [],
}

