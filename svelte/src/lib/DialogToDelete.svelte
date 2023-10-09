<script>
  export let showDialog; // boolean

  let dialog; // HTMLDialogElement

  const deleteArchived = async () => {
    const _res = await fetch("/api/item?delete_archived=true", {
      method: "POST",
    });
    dialog.close();
    window.location.assign("/");
  };

  $: if (dialog && showDialog) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="m-auto">
  <dialog
    class="rounded-md bg-foreground"
    bind:this={dialog}
    on:close={() => (showDialog = false)}
    on:click|self={() => dialog.close()}
  >
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
      <div class="mb-4 p-2 text-background">
        Are you sure to delete all archived items?<br />
        This action is irreversible.
      </div>
      <hr class="my-4 border-background" />
      <!-- svelte-ignore a11y-autofocus -->
      <div class="flex justify-between">
        <button class="text-sm" on:click={() => dialog.close()}>cancel</button>
        <button
          class="rounded-md bg-warning px-2 pt-1 text-sm text-foreground"
          on:click={() => deleteArchived()}>delete</button
        >
      </div>
    </div>
  </dialog>
</div>
