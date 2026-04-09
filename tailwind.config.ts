import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FBF7F0",        // warm cream
        bg2: "#F5EFE3",       // slightly deeper cream
        fg: "#1A1612",        // warm near-black
        muted: "#857C6E",     // warm gray
        card: "#FFFFFF",      // pure white card
        border: "#EAE2D2",    // soft warm border
        accent: "#FF5A3C",    // coral
        accent2: "#7C9E8A",   // sage
        lavender: "#B8A3D9",
      },
      fontFamily: {
        display: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -8px rgba(26, 22, 18, 0.12)",
        pop: "0 8px 32px -8px rgba(26, 22, 18, 0.18)",
      },
      borderRadius: {
        chunk: "24px",
      },
    },
  },
  plugins: [],
} satisfies Config;
