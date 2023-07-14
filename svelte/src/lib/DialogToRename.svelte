<script lang="ts">
  import type { Item } from "../lib/types.ts";

  export let item: Item;
  export let showModal: boolean;

  let dialog: HTMLDialogElement;
  let originalValue = item.value;
  let newValue = item.value;

  const rename = async () => {
    const _res = await fetch(
      `/api/item?rename=true&id=${item.id}&value=${newValue}`,
      {
        method: "POST",
      }
    );
    item.value = newValue;
    originalValue = newValue;
    dialog.close();
  };

  $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="m-auto">
  <dialog
    class="w-5/6 max-w-sm rounded-md bg-slate-100"
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
  >
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
      <div class="p-2 text-xl text-neutral-800">{originalValue}</div>
      <input
        class="max-w-full rounded-full bg-slate-300 px-2 py-1"
        type="text"
        name="value"
        bind:value={newValue}
        on:keydown={(e) => e.key === "Enter" && rename()}
      />

      <hr class="my-4 border-neutral-800" />
      <!-- svelte-ignore a11y-autofocus -->
      <button
        class="rounded-md border border-neutral-800 px-1 text-sm hover:bg-neutral-800 hover:text-slate-100"
        on:click={() => dialog.close()}>close</button
      >
    </div>
  </dialog>
</div>
