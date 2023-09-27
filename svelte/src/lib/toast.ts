import toast from "svelte-french-toast";

export const toastError = (msg: string) => {
  toast.error(msg, {
    position: "bottom-center",
  });
};
