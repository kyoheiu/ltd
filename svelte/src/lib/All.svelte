<script lang="ts">
  import { get } from "svelte/store";
  import Footer from "./Footer.svelte";
  import ItemRenamable from "./ItemRenamable.svelte";
  import { SortableList } from "@jhubbardsf/svelte-sortablejs";
  import { state } from "./stores";
  import type { ItemsWithModifiedTime } from "./types";
  import { receive } from "./Animation";
  import { changeColor, dotColor, toggleArchived } from "./Toggle";
  import { flip } from "svelte/animate";

  const sortItems = async (oldIndex: number, newIndex: number) => {
    const res = await fetch("/api/item/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old: oldIndex,
        new: newIndex,
      }),
    });
    const j: ItemsWithModifiedTime = await res.json();

    state.update((s) => {
      return {
        ...s,
        items: j.items,
        modified: j.modified,
      };
    });
  };

  const itemOrderChanged = async (event) => {
    const resForModifiedTime = await fetch("/api/check");
    const j = await resForModifiedTime.json();
    if (get(state).modified !== j.modified) {
      window.location.reload();
      return;
    } else {
      await sortItems(event.oldIndex, event.newIndex);
    }
  };
</script>

<div class="flex-grow">
  <SortableList
    class="flex flex-col space-y-2"
    ghostClass="invisible"
    dragClass="opacity-100"
    animation={100}
    easing="cubic-bezier(1, 0, 0, 1)"
    onUpdate={itemOrderChanged}
  >
    {#each $state.items as item, index (item)}
      <label
        id={item.id}
        in:receive={{ key: item.id }}
        animate:flip={{ duration: 100 }}
        class="m-auto flex w-5/6 items-center space-x-2 rounded-md border-2 border-slate-200 p-2 text-slate-200"
      >
        <button on:click={() => !item.showModal && toggleArchived(item.id)}
          ><i class="ri-checkbox-blank-fill" /></button
        >
        <ItemRenamable {item} />
        <i class="ri-drag-move-fill" style="margin-left: auto; cursor: move" />
        &nbsp;
        <button
          style="color: {dotColor(item.dot)}"
          on:click={() => changeColor(item.id)}
          ><i class="ri-checkbox-blank-circle-fill" /></button
        >
      </label>
    {/each}
  </SortableList>
</div>
<div class="flex justify-center">
  <Footer />
</div>
