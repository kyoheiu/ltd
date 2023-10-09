<script lang="ts">
  import DialogToRename from "./DialogToRename.svelte";
  import type { Item } from "./types.ts";

  export let item: Item;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="line-clamp-2 flex-auto cursor-pointer break-all pt-1 text-sm"
  on:click={() => (item.showModal = true)}
>
  {item.value}
</div>
<DialogToRename {item} bind:showModal={item.showModal} />
