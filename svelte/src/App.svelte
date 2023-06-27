<script lang="ts">
  import { onMount } from "svelte";
  import SortableList from "@palsch/svelte-sortablejs";
  import { ulid } from "ulid";

  interface Task {
    id: string;
    value: string;
    todo: boolean;
    tags: string[] | null;
  }

  let items = [];
  onMount(async () => {
    const res = await fetch("/task");
    const j: Task[] = await res.json();
    items = j;
  });

  let newItem = "";

  const sortableOptions = {
    group: "items",
    animation: 100,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };

  function addItem(value: string) {
    console.log("item to add: " + value);
    const id = ulid();
    console.log(id);
    items.unshift({
      id: id,
      value: value,
    });
    items = items;
    newItem = "";

    fetch("/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        value: value,
      }),
    }).then((res) => {
      console.log(res.status);
    });
  }

  function deleteItem(id) {
    const i = items.findIndex((item) => item.id === id);
    console.log(`item to delete: ${id} at ${i}`)
    items.splice(i, 1);
    items = items;

    fetch("/task", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        position: i,
      }),
    }).then((res) => {
      console.log(res.status);
    });
  }

  function itemOrderChanged(event) {
    console.log("item order changed!", event.detail);
  }

  function getItemById(id) {
    return items.find((item) => item.id === id);
  }
</script>

<main>
  <h1>Yet another todo app.</h1>
  <input type="text" bind:value={newItem} />
  <button on:click={() => addItem(newItem)}>add</button>
  <SortableList
    {sortableOptions}
    on:orderChanged={itemOrderChanged}
    bind:items
    idKey="id"
    let:item
    {getItemById}
  >
    {item.value}
    {#if item.tags}
    {#each item.tags as tag}
      <div>{tag}</div>
    {/each}
    {/if}
    <input type="checkbox" />
    <button on:click={() => deleteItem(item.id)}>x</button>
  </SortableList>
</main>

<style>
</style>
