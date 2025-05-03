/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
          teal: "#48E2B3",
          cyan: "#53D5F0",
          purple: "#9F7AEA",
        },
        "subtle-border": "rgba(255,255,255,0.1)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        brand: {
          green: {
            light: "#48E2B3",
            DEFAULT: "#48E2B3",
            dark: "#3BC89C",
          },
        },
        "glass-panel": "rgba(30, 30, 40, 0.5)",
        "glass-panel-light": "rgba(50, 50, 70, 0.3)",
        "sentiment-positive": "#48E2B3",
        "sentiment-neutral": "#F9A825",
        "sentiment-negative": "#F87171",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "gradient-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "gradient-move": "gradient-move 15s ease infinite",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".glass-panel": {
          "background-color": "rgba(30, 30, 40, 0.5)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)",
        },
        ".glass-panel-light": {
          "background-color": "rgba(50, 50, 70, 0.3)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.1)",
        },
        ".text-gradient": {
          "background-image": "linear-gradient(90deg, #48E2B3, #9F7AEA)",
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
        },
        ".text-gradient-teal": {
          "background-image": "linear-gradient(90deg, #48E2B3, #53D5F0)",
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
        },
        ".scrollbar-none": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      };
      addUtilities(newUtilities);
    }),



  ],
};
