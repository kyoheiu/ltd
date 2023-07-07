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
    class="bg-slate-100 w-5/6 max-w-sm rounded-md"
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
  >
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
      <div class="text-neutral-800 text-xl p-2">{originalValue}</div>
      <input
        class="bg-slate-300 py-1 px-2 rounded-full max-w-full"
        type="text"
        name="value"
        bind:value={newValue}
        on:keydown={(e) => e.key === "Enter" && rename()}
      />

      <hr class="border-neutral-800 my-4" />
      <!-- svelte-ignore a11y-autofocus -->
      <button
        class="text-sm border-neutral-800 hover:bg-neutral-800 hover:text-slate-100 rounded-md border-2 px-1"
        on:click={() => dialog.close()}>close</button
      >
    </div>
  </dialog>
</div>
