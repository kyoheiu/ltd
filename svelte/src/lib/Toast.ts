import { toast } from "@zerodevx/svelte-toast";

export const toastMsg = (s: string) => {
    toast.pop(0);
    toast.push(s, {
        duration: 2000,
        theme: {
            "--toastBarHeight": 0,
        },
    });
};