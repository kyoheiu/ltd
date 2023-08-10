/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
    // Color scheme based on Catppuccin Macchiato.
    // https://github.com/catppuccin/kitty
    colors: {
      slate: colors.slate,
      neutral: colors.neutral,
      rose: colors.rose,
      "default": "#A5ADCB",
      "green": "#A6DA95",
      "yellow": "#EED49F",
      "red": "#ED8796",
      "archived": "#A5ADCB", 
    }
  },
  plugins: [],
};
