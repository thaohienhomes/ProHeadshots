import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
  theme: {
    extend: {
      colors: {
        mainWhite: '#f6f5ec',
        mainBlack: '#091E25',
        mainGreen: '#CEFF66',
        mainOrange: "#F1C40F",
      },
      maxWidth: {
        'section': '1200px', // Adjust this value as needed
      },
      padding: {
        'section': '1rem', // This corresponds to the previous 'px-4' class
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
        'progress-bar': 'progress 2s linear infinite',
        'progress-piece': 'progress-piece 2s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
