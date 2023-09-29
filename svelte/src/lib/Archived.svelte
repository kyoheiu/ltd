<script lang="ts">
  import { flip } from "svelte/animate";
  import { receive } from "./Animation";
  import DialogToDelete from "./DialogToDelete.svelte";
  import Footer from "./Footer.svelte";
  import { toggleArchived } from "./toggle";
  import { state } from "./stores";
  import { get } from "svelte/store";
  import Dot from "./Dot.svelte";
  import IconSquare from "@tabler/icons-svelte/dist/svelte/icons/IconSquare.svelte";
  import IconSquareCheck from "@tabler/icons-svelte/dist/svelte/icons/IconSquareCheck.svelte";

  let showDialog = get(state).showDialog;
</script>

<div class="flex-grow">
  <div class="mb-4 flex flex-col">
    <button
      class="m-auto rounded-full border bg-warning px-2 text-sm text-foreground"
      on:click={() => (showDialog = true)}
      ><i class="ri-delete-bin-2-fill" /> Delete all archived items</button
    >
    <DialogToDelete bind:showDialog />
  </div>
  <ul class="flex flex-col space-y-2">
    {#each $state.archived as item, _index (item)}
      <li
        in:receive={{ key: item.id }}
        animate:flip={{ duration: 100 }}
        class="m-auto flex w-52 items-center space-x-2 rounded-md border-2 border-foreground p-2 text-sm text-foreground sm:w-80"
      >
        <button on:click={() => toggleArchived(item.id)}
          ><IconSquareCheck /></button
        >
        <div class="line-clamp-2 flex-auto break-all">{item.value}</div>
        <Dot {item} />
      </li>
    {/each}
  </ul>
</div>
<div class="flex justify-center">
  <Footer />
</div>
