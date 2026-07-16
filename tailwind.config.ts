import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f1a",
        surface: "#1e1e2e",
        "surface-raised": "#252535",
        border: "#2a2a3a",
        primary: {
          DEFAULT: "#8B0000",
          hover: "#a01010",
        },
        accent: "#B8860B",
        text: {
          DEFAULT: "#e8e8e8",
          secondary: "#a0a0b0",
          muted: "#606070",
        },
        success: "#2d5a27",
        warning: "#7a4f00",
        danger: "#5a1a1a",
        info: "#1a3a5a",
        // Status de revelação
        unknown: "#2a2a2a",
        spotted: "#1a2a3a",
        known: "#1e1e2e",
        investigated: "#1a2a1a",
        // Tipos de NPC
        ally: "#1a3a1a",
        antagonist: "#3a2a1a",
        villain: "#3a1a1a",
      },
      fontFamily: {
        title: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      spacing: {
        "2xl": "48px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
