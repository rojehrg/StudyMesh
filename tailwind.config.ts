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
        // Semantic colors using CSS variables (theme-aware)
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Catppuccin Latte (Light Mode) - Your provided colors
        "ctp-latte": {
          rosewater: '#dc8a78',
          flamingo: '#dd7878',
          pink: '#ea76cb',
          mauve: '#8839ef',
          red: '#d20f39',
          maroon: '#e64553',
          peach: '#fe640b',
          yellow: '#df8e1d',
          green: '#40a02b',
          teal: '#179299',
          sky: '#04a5e5',
          sapphire: '#209fb5',
          blue: '#1e66f5',
          lavender: '#7287fd',
          text: '#4c4f69',
          subtext1: '#5c5f77',
          subtext0: '#6c6f85',
          overlay2: '#7c7f93',
          overlay1: '#8c8fa1',
          overlay0: '#9ca0b0',
          surface2: '#acb0be',
          surface1: '#bcc0cc',
          surface0: '#ccd0da',
          base: '#eff1f5',
          mantle: '#e6e9ef',
          crust: '#dce0e8',
        },

        // Catppuccin Mocha (Dark Mode)
        "ctp-mocha": {
          rosewater: '#f5e0dc',
          flamingo: '#f2cdcd',
          pink: '#f5c2e7',
          mauve: '#cba6f7',
          red: '#f38ba8',
          maroon: '#eba0ac',
          peach: '#fab387',
          yellow: '#f9e2af',
          green: '#a6e3a1',
          teal: '#94e2d5',
          sky: '#89dceb',
          sapphire: '#74c7ec',
          blue: '#89b4fa',
          lavender: '#b4befe',
          text: '#cdd6f4',
          subtext1: '#bac2de',
          subtext0: '#a6adc8',
          overlay2: '#9399b2',
          overlay1: '#7f849c',
          overlay0: '#6c7086',
          surface2: '#585b70',
          surface1: '#45475a',
          surface0: '#313244',
          base: '#1e1e2e',
          mantle: '#181825',
          crust: '#11111b',
        },

        // Theme-aware Catppuccin colors (use CSS variables)
        ctp: {
          rosewater: 'hsl(var(--ctp-rosewater))',
          flamingo: 'hsl(var(--ctp-flamingo))',
          pink: 'hsl(var(--ctp-pink))',
          mauve: 'hsl(var(--ctp-mauve))',
          red: 'hsl(var(--ctp-red))',
          maroon: 'hsl(var(--ctp-maroon))',
          peach: 'hsl(var(--ctp-peach))',
          yellow: 'hsl(var(--ctp-yellow))',
          green: 'hsl(var(--ctp-green))',
          teal: 'hsl(var(--ctp-teal))',
          sky: 'hsl(var(--ctp-sky))',
          sapphire: 'hsl(var(--ctp-sapphire))',
          blue: 'hsl(var(--ctp-blue))',
          lavender: 'hsl(var(--ctp-lavender))',
          text: 'hsl(var(--ctp-text))',
          subtext1: 'hsl(var(--ctp-subtext1))',
          subtext0: 'hsl(var(--ctp-subtext0))',
          overlay2: 'hsl(var(--ctp-overlay2))',
          overlay1: 'hsl(var(--ctp-overlay1))',
          overlay0: 'hsl(var(--ctp-overlay0))',
          surface2: 'hsl(var(--ctp-surface2))',
          surface1: 'hsl(var(--ctp-surface1))',
          surface0: 'hsl(var(--ctp-surface0))',
          base: 'hsl(var(--ctp-base))',
          mantle: 'hsl(var(--ctp-mantle))',
          crust: 'hsl(var(--ctp-crust))',
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
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
