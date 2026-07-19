/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07070f",
          900: "#0b0b16",
          800: "#12121f",
          700: "#1a1a2b",
        },
        onion: {
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        neo: {
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      fontFamily: {
        sans: [
          "Manrope",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Unbounded",
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12)",
        float: "0 24px 64px rgba(0,0,0,.5)",
        "glow-violet": "0 0 24px rgba(139,92,246,.35)",
        "glow-cyan": "0 0 24px rgba(34,211,238,.3)",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
}
