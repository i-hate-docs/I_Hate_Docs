import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: "#0A0A0A",
        ink: "#070707",
        pond: "#0F0F12",
        cyber: {
          DEFAULT: "#FFD400",
          50: "#FFFCE6",
          100: "#FFF7B3",
          200: "#FFEC66",
          300: "#FFE233",
          400: "#FFD400",
          500: "#E6BE00",
          600: "#B39400",
        },
        neon: {
          cyan: "#00E5FF",
          purple: "#B026FF",
          pink: "#FF2FD0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-spot":
          "radial-gradient(800px circle at var(--mx,50%) var(--my,50%), rgba(255,212,0,0.10), transparent 40%)",
        "duck-gradient":
          "linear-gradient(135deg, #FFD400 0%, #FFB800 50%, #FF8A00 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(255,212,0,0.35), 0 0 80px rgba(255,212,0,0.15)",
        "glow-cyan":
          "0 0 40px rgba(0,229,255,0.35), 0 0 80px rgba(0,229,255,0.15)",
        "glow-purple":
          "0 0 40px rgba(176,38,255,0.35), 0 0 80px rgba(176,38,255,0.15)",
        glass:
          "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 30px 60px -30px rgba(0,0,0,0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
