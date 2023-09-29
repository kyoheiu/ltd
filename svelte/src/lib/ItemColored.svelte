<script lang="ts">
  import { flip } from "svelte/animate";
  import { receive } from "./Animation";
  import { state } from "./stores";
  import DialogToRename from "./DialogToRename.svelte";
  import Footer from "./Footer.svelte";
  import { toggleArchived } from "./toggle";
  import IconSquare from "@tabler/icons-svelte/dist/svelte/icons/IconSquare.svelte";
  import Dot from "./Dot.svelte";
</script>

<div class="flex-grow">
  <ul class="flex flex-col space-y-2">
    {#each $state.items.filter((x) => x.dot === $state.page - 1) as item, index (item)}
      <li
        in:receive={{ key: item.id }}
        animate:flip={{ duration: 100 }}
        class="m-auto flex w-52 items-center space-x-2 rounded-md border-2 border-foreground p-2 text-foreground sm:w-80"
      >
        <button on:click={() => toggleArchived(item.id)}><IconSquare /></button>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="line-clamp-2 flex-auto cursor-pointer break-all text-sm"
          on:click={() => (item.showModal = true)}
        >
          {item.value}
        </div>
        <DialogToRename bind:item bind:showModal={item.showModal} />

        <Dot {item} />
      </li>
    {/each}
  </ul>
</div>
<div class="flex justify-center">
  <Footer />
</div>
