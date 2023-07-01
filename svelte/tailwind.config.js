/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
    colors: {
      slate: colors.slate,
      neutral: colors.neutral,
      "base": "#A5ADCB",
      "green": "#A6DA95",
      "yellow": "#EED49F",
      "red": "#ED8796",
      "archived": "#A5ADCB",
    }
  },
  plugins: [],
};
