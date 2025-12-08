import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // New Mediterranean color palette
        terra: {
          50: '#FDF5F3',
          100: '#FAE8E4',
          200: '#F5D0C7',
          300: '#EDB0A1',
          400: '#E07A5F', // Primary Terra Cotta
          500: '#D4634A',
          600: '#B84D38',
          700: '#9A3F2E',
          800: '#7D3526',
          900: '#662D22',
        },
        sage: {
          50: '#F4F9F6',
          100: '#E5F0EA',
          200: '#C9E0D5',
          300: '#A3C9B5',
          400: '#81B29A', // Primary Sage
          500: '#5E9A7D',
          600: '#4A7D64',
          700: '#3D6652',
          800: '#345343',
          900: '#2C4438',
        },
        sand: {
          50: '#FEFCF6',
          100: '#FCF7E9',
          200: '#F9EDCE',
          300: '#F2CC8F', // Primary Sand
          400: '#ECBA6A',
          500: '#E3A344',
          600: '#D08A2D',
          700: '#AD6F26',
          800: '#8B5826',
          900: '#724923',
        },
        charcoal: {
          50: '#F5F5F7',
          100: '#E8E8EC',
          200: '#D1D2D9',
          300: '#A9ABB8',
          400: '#7B7E91',
          500: '#5C5F73',
          600: '#4A4D5E',
          700: '#3D405B', // Primary Charcoal Blue
          800: '#34364C',
          900: '#2D2F41',
        },
        cream: {
          50: '#FDFCF9',
          100: '#F9F7F0',
          200: '#F4F1DE', // Primary Cream
          300: '#ECE7C9',
          400: '#E0D9AD',
          500: '#D4CA91',
          600: '#C4B76E',
          700: '#A99B52',
          800: '#8A7E45',
          900: '#72683C',
        },
      },
      borderRadius: {
        lg: "1rem", // 16px - large cards
        md: "0.75rem", // 12px - cards, inputs
        sm: "0.5rem", // 8px - buttons, badges
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
