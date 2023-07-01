<script>
    import "remixicon/fonts/remixicon.css";
    export let showModal; // boolean

    let dialog; // HTMLDialogElement

    $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="m-auto">
<dialog
    class="bg-slate-600 w-auto rounded-md"
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <slot />
        <hr class="my-4"/>
        <!-- svelte-ignore a11y-autofocus -->
        <button class="bg-slate-200 text-sm ml-auto rounded-md border-2 px-1" autofocus on:click={() => dialog.close()}
            >cancel</button
        >
    </div>
</dialog>
</div>