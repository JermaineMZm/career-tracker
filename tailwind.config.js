/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gradient: {
          start: "#667eea",
          mid: "#764ba2",
          end: "#f093fb",
        },
        accent: {
          purple: "#a78bfa",
          blue: "#60a5fa",
          pink: "#f472b6",
          green: "#34d399",
          orange: "#fb923c",
        },
      },
      backgroundImage: {
        "gradient-main":
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        "gradient-subtle":
          "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        "gradient-warm":
          "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        "gradient-cool":
          "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(102, 126, 234, 0.3)",
        "glow-md": "0 0 20px rgba(102, 126, 234, 0.4)",
        "glow-lg": "0 0 30px rgba(102, 126, 234, 0.5)",
      },
    },
  },
  plugins: [],
};
