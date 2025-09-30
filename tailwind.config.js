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

        // Updated background color to gradient (for bg-background)
        background: '#1E3A8A', // fallback navy for Tailwind class usage

        // Updated card color to match login container (for bg-card)
        card: '#0B0B0B', // pure black for wow effect

        // Optionally, add even deeper black for dark accents if needed
        darkcard: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        // Custom gradient for background
        'blue-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #060A38 100%)',
      }
    }
  },
  plugins: [],
}
