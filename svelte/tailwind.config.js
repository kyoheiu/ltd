/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
    // color scheme: catppuccin macchiato
    colors: {
      slate: colors.slate,
      neutral: colors.neutral,
      rose: colors.rose,
      "default": "#A5ADCB",
      "green": "#A6DA95",
      "yellow": "#EED49F",
      "red": "#ED8796",
      "archived": "#A5ADCB", 
      "background": "#24273A"
    }
  },
  plugins: [],
};
