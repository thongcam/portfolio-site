/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
      white: "#ffffff",
      gray: "#F9F9FA",
      "dark-gray": "#e0e0e1",
      "dark-blue": "#111F31",
      "dark-blue-hover": "#293546",
      "pale-blue": "#21324c",
      yellow: "#EBB723",
      cyan: "#34BAB4",
      "dark-cyan": "#198F8A",
    },
    extend: {
      spacing: {
        15: "3.75rem",
        25: "6.25rem",
        30: "7.5rem",
        50: "12.5rem",
        75: "18.75rem",
        100: "25rem",
        125: "31.25rem",
        150: "37.5rem",
      },
      screens: {
        s: "434px",
        md: "741px",
        lg: "1047px",
        xl: "1200px",
        "2xl": "1350px",
      },
      fontSize: {
        sm: "0.9rem",
        base: "1rem",
        lg: "1.2rem",
        xl: "1.4rem",
        "6xl": "clamp(3rem, 5.5vw, 3.75rem)",
      },
      fontFamily: {
        display: ["Noto Serif Variable", "serif"],
        body: ["Nunito Variable", "sans-serif"],
      },
    },
    animation: {
      underlining: "underline 1000ms 200ms cubic-bezier(0, 0, 0.2, 1) forwards",
    },
    keyframes: {
      underline: {
        "0%": { backgroundSize: "0% 0.8rem" },
        "100%": { backgroundSize: "100% 0.8rem" },
      },
    },
  },
  plugins: [],
};
