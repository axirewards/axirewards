/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Navy Blue
        secondary: '#3B82F6', // Blue accent
        accent: '#60A5FA',    // Light blue
        background: '#F1F5F9', // Light gray background
        card: '#ffffff'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: [],
}
