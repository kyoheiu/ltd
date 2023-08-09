<script lang="ts">
  import { get } from "svelte/store";
  import Footer from "./Footer.svelte";
  import ItemRenamable from "./ItemRenamable.svelte";
  import SortableList from "./SortableList.svelte";
  import { state } from "./stores";
  import type { Item } from "./types";
  import { receive } from "./Animation";
  import { changeColor, toggleArchived } from "./Toggle";

  const sortItems = async () => {
    const items = get(state).items;
    const archived = get(state).archived;

    const arr = items.concat(archived);
    const res = await fetch("/api/item/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: arr,
      }),
    });
    return res;
  };

  const itemOrderChanged = async (event) => {
    const resForModifiedTime = await fetch("/api/check");
    const j = await resForModifiedTime.json();
    if (get(state).modified !== j.modified) {
      window.location.reload();
      return;
    } else {
      const newTodo: Item[] = event.detail;
      const res = await sortItems();
      const j = await res.json();

      state.update((s) => {
        return {
          ...s,
          items: newTodo,
          modified: j.modified,
        };
      });
    }
  };

  const getItemById = (id: string) => {
    return get(state).items.find((item) => item.id === id);
  };

  const sortableOptions = {
    store: {
      group: "items",
      animation: 100,
      easing: "cubic-bezier(1, 0, 0, 1)",
    },
  };

  let items = get(state).items;

  function dotColor(dot: any) {
    throw new Error("Function not implemented.");
  }
</script>

<div class="flex-grow">
  <SortableList
    {sortableOptions}
    on:orderChanged={itemOrderChanged}
    bind:items
    let:item
    idKey="id"
    {getItemById}
    ulClass="flex flex-col space-y-2"
  >
    <label
      in:receive={{ key: item.id }}
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
  </SortableList>
</div>
<div class="flex justify-center">
  <Footer />
</div>
