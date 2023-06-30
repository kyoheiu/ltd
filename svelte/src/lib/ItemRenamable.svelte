<script lang="ts">
    import Modal from "./Modal.svelte";
    import Rename from "./Rename.svelte";
    import type { Item } from "./types.ts";

    export let item: Item;
</script>

<div class="flex-auto break-all line-clamp-2 cursor-pointer" on:click={() => (item.showModal = true)}
    >{item.value}</div>
<Modal bind:showModal={item.showModal}>
    <Rename value={item.value} id={item.id} />
</Modal>
