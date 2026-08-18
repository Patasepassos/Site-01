import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3D1F15',
        secondary: '#A36C43',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #F8F5EF 0%, #EFE4D8 50%, #D8B994 100%)',
      },
    },
  },
  plugins: [],
}
export default config
