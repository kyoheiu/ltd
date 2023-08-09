import { quintOut } from "svelte/easing";
import { crossfade } from "svelte/transition";

// Animation when adding/archiving/unarchiving item
export const [_send, receive] = crossfade({
  duration: (d) => Math.sqrt(d * 200),

  fallback(node, _params) {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    return {
      duration: 100,
      easing: quintOut,
      css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
    };
  },
});
