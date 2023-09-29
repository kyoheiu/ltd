import Toastify from "toastify-js";

export const toastError = (msg: string) => {
  Toastify({
    text: `Error: ${msg}`,
    className:
      "!border-l-8 !border-warning !bg-none !bg-none !bg-foreground !text-none !text-background",
    duration: 2000,
    gravity: "bottom",
    position: "center",
    stopOnFocus: true,
  }).showToast();
};
