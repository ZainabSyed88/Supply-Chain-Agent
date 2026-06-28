export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      colors: {
        primary: { DEFAULT: "#1e40af", light: "#3b82f6", dark: "#1e3a8a" },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        brand: "#1e40af"
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.06)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 10px 10px -5px rgba(15, 23, 42, 0.04)"
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        pulseRing: "pulse-ring 1.4s ease-in-out infinite"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.28)" },
          "50%": { boxShadow: "0 0 0 8px rgba(59, 130, 246, 0)" }
        }
      }
    }
  },
  plugins: []
}
