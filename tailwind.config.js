/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chinese: {
          red: '#c93b2b',
          gold: '#e5a93c',
          ink: '#1a1a1a',
          paper: '#faf7f2',
          border: '#e8dfd8'
        }
      },
      fontFamily: {
        korean: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        chinese: ['"Noto Serif SC"', '"Source Han Serif CN"', '"Songti SC"', 'SimSun', 'STSong', 'serif']
      }
    },
  },
  plugins: [],
}
