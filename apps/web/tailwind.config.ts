import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "hsl(var(--brand-green) / <alpha-value>)",
        },
        emerald: {
          DEFAULT: "hsl(var(--brand-green) / <alpha-value>)",
          50: "hsl(var(--brand-green) / <alpha-value>)",
          100: "hsl(var(--brand-green) / <alpha-value>)",
          200: "hsl(var(--brand-green) / <alpha-value>)",
          300: "hsl(var(--brand-green) / <alpha-value>)",
          400: "hsl(var(--brand-green) / <alpha-value>)",
          500: "hsl(var(--brand-green) / <alpha-value>)",
          600: "hsl(var(--brand-green) / <alpha-value>)",
          700: "hsl(var(--brand-green) / <alpha-value>)",
          800: "hsl(var(--brand-green) / <alpha-value>)",
          900: "hsl(var(--brand-green) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
