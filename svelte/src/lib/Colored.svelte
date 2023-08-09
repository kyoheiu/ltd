<script lang="ts">
  import { flip } from "svelte/animate";
  import { receive } from "./Animation";

  import { state } from "./stores";
  import DialogToRename from "./DialogToRename.svelte";
  import Footer from "./Footer.svelte";
  import { toggleArchived, changeColor, dotColor } from "./Toggle";
</script>

<div class="flex-grow">
  <ul class="flex flex-col space-y-2">
    {#each $state.items.filter((x) => x.dot === $state.page - 1) as item, index (item)}
      <label
        in:receive={{ key: item.id }}
        animate:flip={{ duration: 100 }}
        class="m-auto flex w-5/6 items-center space-x-2 rounded-md border-2 border-slate-200 p-2 text-slate-200"
      >
        <button on:click={() => !item.showModal && toggleArchived(item.id)}
          ><i class="ri-checkbox-blank-fill" /></button
        >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="line-clamp-2 flex-auto cursor-pointer break-all"
          on:click={() => (item.showModal = true)}
        >
          {item.value}
        </div>
        <DialogToRename bind:item bind:showModal={item.showModal} />

        <button
          style="color: {dotColor(item.dot)}; margin-left: auto"
          on:click={() => changeColor(item.id)}
          ><i class="ri-checkbox-blank-circle-fill" /></button
        >
      </label>
    {/each}
  </ul>
</div>
<div class="flex justify-center">
  <Footer />
</div>
