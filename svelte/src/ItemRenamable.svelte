<script lang="ts">
    import Modal from "./Modal.svelte";
    import Rename from "./Rename.svelte";
    import type { Item } from "./types.ts";

    export let item: Item;
</script>

<button class="flex-auto max-w-xs w-2/3" on:click={() => (item.showModal = true)}
    ><div class="text-left truncate">{item.value}</div></button
>
<Modal bind:showModal={item.showModal}>
    <Rename value={item.value} id={item.id} />
</Modal>
