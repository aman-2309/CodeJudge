// tailwind.config.js
// Add/merge this into your existing config

export default {
  // ...your existing content, etc.
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        leetcode: {
          "base-100": "#1a1a1a", // page background
          "base-200": "#262626", // panels, tab bars, code blocks
          "base-300": "#333333", // borders, inset blocks
          "primary": "#ffa116",  // LeetCode orange (Submit button, active tab, accents)
          "primary-content": "#1a1a1a", // text on primary (dark text on orange)
          "neutral": "#3a3a3a",
          "success": "#2cbb5d",
          "warning": "#ffc01e",
          "error": "#ff375f",
          "info": "#5c9eff",
          "base-content": "#e0e0e0", // default text color
        },
      },
    ],
    darkTheme: "leetcode",
  },
};
