<script lang="ts">
  import { flip } from "svelte/animate";
  import { receive } from "./Animation";
  import DialogToDelete from "./DialogToDelete.svelte";
  import Footer from "./Footer.svelte";
  import { toggleArchived, dotColor, changeColor } from "./Toggle";
  import { state } from "./stores";
  import { get } from "svelte/store";

  let showDialog = get(state).showDialog;
</script>

<div class="flex-grow">
  <div class="mb-4 flex flex-col">
    <button
      class="m-auto rounded-full border border-rose-500 px-2 text-sm text-rose-500 hover:bg-rose-500 hover:text-slate-200"
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
        class="m-auto flex w-5/6 space-x-2 rounded-md border-2 border-slate-200 p-2 text-slate-200"
      >
        <button on:click={() => toggleArchived(item.id)}
          ><i class="ri-checkbox-fill" /></button
        >
        <div class="line-clamp-2 flex-auto break-all">{item.value}</div>
        <button
          style="color: {dotColor(item.dot)}; margin-left: auto"
          on:click={() => changeColor(item.id)}
          ><i class="ri-checkbox-blank-circle-fill" /></button
        >
      </li>
    {/each}
  </ul>
</div>
<div class="flex justify-center">
  <Footer />
</div>
