<script>
    import "remixicon/fonts/remixicon.css";
    export let showModal; // boolean

    let dialog; // HTMLDialogElement

    $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    class="w-5/6 bg-slate-600"
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <slot />
        <hr />
        <!-- svelte-ignore a11y-autofocus -->
        <button class="text-sm text-slate-200 ml-auto" autofocus on:click={() => dialog.close()}
            >close</button
        >
    </div>
</dialog>
