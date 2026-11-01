/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#7C3AED",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95"
        },
        magenta: "#EC4899",
        sunny: "#FACC15",
        ink: "#1F2937",
        cream: "#FFF9F0"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 24px 60px -24px rgba(124,58,237,.35)",
        card: "0 12px 32px -16px rgba(31,41,55,.2)",
        glow: "0 0 0 1px rgba(124,58,237,.08), 0 20px 50px -20px rgba(124,58,237,.4)"
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.75rem" },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        floatSlow: {
          "0%,100%": { transform: "translateY(0) rotate(-3deg)" },
          "50%": { transform: "translateY(-16px) rotate(2deg)" }
        },
        marquee: { to: { transform: "translateX(-50%)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pop: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.35)" }, "100%": { transform: "scale(1)" } },
        toastIn: {
          from: { opacity: "0", transform: "translateY(14px) scale(.97)" },
          to: { opacity: "1", transform: "none" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        pop: "pop .4s ease",
        "toast-in": "toastIn .35s cubic-bezier(.22,1,.36,1)"
      }
    }
  },
  plugins: []
};
