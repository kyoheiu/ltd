import Toastify from "toastify-js";

export const toast = (msg: string) => {
  Toastify({
    text: msg,
    className: "!bg-none !bg-foreground !text-none !text-background",
    duration: 2000,
    gravity: "bottom",
    position: "center",
    stopOnFocus: true,
  }).showToast();
};
