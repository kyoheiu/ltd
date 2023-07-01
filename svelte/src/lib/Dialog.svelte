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
        class="bg-slate-100 w-5/6 max-w-sm rounded-md"
        bind:this={dialog}
        on:close={() => (showDialog = false)}
        on:click|self={() => dialog.close()}
    >
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click|stopPropagation>
            <slot />
            <hr class="border-neutral-800 my-4" />
            <!-- svelte-ignore a11y-autofocus -->
            <div class="flex justify-between">
                <button
                    class="text-sm border-neutral-800 hover:bg-neutral-800 hover:text-slate-100 rounded-md border-2 px-1"
                    on:click={() => dialog.close()}>cancel</button
                >
                <form method="post" action="/api/delete">
                    <button
                        class="border-red text-red hover:bg-red hover:text-slate-50 text-sm rounded-md border-2 px-1"
                        >delete</button
                    >
                </form>
            </div>
        </div>
    </dialog>
</div>
