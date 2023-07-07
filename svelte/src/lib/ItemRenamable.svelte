<script lang="ts">
  import DialogToRename from "./DialogToRename.svelte";
  import type { Item } from "./types.ts";

  export let item: Item;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="flex-auto break-all line-clamp-2 cursor-pointer"
  on:click={() => (item.showModal = true)}
>
  {item.value}
</div>
<DialogToRename item={item} bind:showModal={item.showModal} />
