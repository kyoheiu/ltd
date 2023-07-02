import { toast } from "@zerodevx/svelte-toast";

export const toastMsg = (s: string) => {
    toast.pop(0);
    toast.push(s, {
        intro: { x: 0 },
        duration: 2000,
        reversed: true,
        theme: {
            "--toastBarHeight": 0,
        },
    });
};