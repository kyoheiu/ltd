/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
    // Color scheme based on Catppuccin Macchiato.
    // https://github.com/catppuccin/kitty
    colors: {
      "foreground": "#f8fafc",
      "background": "#0f172a",
      "default": "#A5ADCB",
      "green": "#A6DA95",
      "yellow": "#EED49F",
      "red": "#ED8796",
      "warning": "#f43f5e",
      "further": "#94a3b8",
    }
  },
  plugins: [],
};
