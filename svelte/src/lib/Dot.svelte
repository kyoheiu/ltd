<script lang="ts">
  import IconSpadeFilled from "@tabler/icons-svelte/dist/svelte/icons/IconSpadeFilled.svelte";
  import IconHeartFilled from "@tabler/icons-svelte/dist/svelte/icons/IconHeartFilled.svelte";
  import IconClubsFilled from "@tabler/icons-svelte/dist/svelte/icons/IconClubsFilled.svelte";
  import IconDiamondsFilled from "@tabler/icons-svelte/dist/svelte/icons/IconDiamondsFilled.svelte";
  import { changeColor } from "./Toggle";
  import { SYMBOL_SIZE, type Item } from "./types";

  export let item: Item;
</script>

{#if item.dot === 0}
  <button
    class="ml-auto text-default"
    title="Click / tap to toggle item category"
    on:click={() => changeColor(item.id)}
  >
    <IconSpadeFilled size={SYMBOL_SIZE} />
  </button>
{:else if item.dot === 1}
  <button
    class="ml-auto text-green"
    title="Click / tap to toggle item category"
    on:click={() => changeColor(item.id)}
  >
    <IconHeartFilled size={SYMBOL_SIZE} />
  </button>
{:else if item.dot === 2}
  <button
    class="ml-auto text-yellow"
    title="Click / tap to toggle item category"
    on:click={() => changeColor(item.id)}
  >
    <IconClubsFilled size={SYMBOL_SIZE} />
  </button>
{:else}
  <button
    class="ml-auto text-red"
    title="Click / tap to toggle item category"
    on:click={() => changeColor(item.id)}
  >
    <IconDiamondsFilled size={SYMBOL_SIZE} />
  </button>
{/if}
