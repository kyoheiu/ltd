<script>
  import "remixicon/fonts/remixicon.css";
  export let showModal; // boolean

  let dialog; // HTMLDialogElement

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
      <slot />
      <hr class="border-neutral-800 my-4" />
      <!-- svelte-ignore a11y-autofocus -->
      <button
        class="text-sm border-neutral-800 hover:bg-neutral-800 hover:text-slate-100 rounded-md border-2 px-1"
        on:click={() => dialog.close()}>close</button
      >
    </div>
  </dialog>
</div>
