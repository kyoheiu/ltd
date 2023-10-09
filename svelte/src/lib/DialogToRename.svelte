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
    class="w-5/6 max-w-sm rounded-md bg-foreground"
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
  >
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
      <div class="text-xl text-background">{originalValue}</div>
      <input
        class="bg-slate-200 my-6 w-full rounded-full border px-4 py-1"
        type="text"
        name="value"
        bind:value={newValue}
        on:keydown={(e) => e.key === "Enter" && rename()}
      />

      <button class="rounded-md text-sm" on:click={() => dialog.close()}
        >close</button
      >
    </div>
  </dialog>
</div>
