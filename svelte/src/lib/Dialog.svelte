<script>
    import "remixicon/fonts/remixicon.css";
    import { toastMsg } from "./Toast.ts";

    export let showDialog; // boolean

    let dialog; // HTMLDialogElement

    $: if (dialog && showDialog) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="m-auto">
    <dialog
        class="bg-slate-600 w-auto rounded-md"
        bind:this={dialog}
        on:close={() => (showDialog = false)}
        on:click|self={() => dialog.close()}
    >
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click|stopPropagation>
            <slot />
            <hr class="my-4" />
            <!-- svelte-ignore a11y-autofocus -->
            <div class="flex justify-between">
                <button
                    class="bg-slate-200 text-sm rounded-md border-2 px-1"
                    on:click={() => dialog.close()}>cancel</button
                >
                <form method="post" action="/api/delete">
                    <button
                        class="bg-slate-200 text-sm rounded-md border-2 px-1"
                        >delete</button
                    >
                </form>
            </div>
        </div>
    </dialog>
</div>
