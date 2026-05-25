import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        // Accent red/orange used for the cursor + section pointer.
        accent: "#ed4d24",
      },
      fontSize: {
        "xs-tight": ["var(--font-xs)", { lineHeight: "calc(var(--font-xs) * 1.33)" }],
        "sm-tight": ["var(--font-sm)", { lineHeight: "calc(var(--font-sm) * 1.4)" }],
        "base-tight": ["var(--font-base)", { lineHeight: "calc(var(--font-base) * 1.36)" }],
      },
      letterSpacing: {
        tightish: "0.01em",
      },
    },
  },
  plugins: [],
};

export default config;
