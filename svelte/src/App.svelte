<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import { onMount } from "svelte";
  import SortableList from "@palsch/svelte-sortablejs";
  import { ulid } from "ulid";

  interface Task {
    id: string;
    value: string;
    todo: boolean;
    category: string | null;
  }

  let items = [];
  let items2 = [];
  onMount(async () => {
    const res = await fetch("/task");
    const j: Task[] = await res.json();
    items = j;
    items2 = j;
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

    fetch("/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: id,
        value: value,
      }),
    }).then((res) => {
      console.log(res.status);
    });
  }

  function itemOrderChanged(event) {
    console.log("item order changed!", event.detail);
  }

  function getItemById(id) {
    return items.concat(items2).find((item) => item.id == id);
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
    <input type="checkbox" />
  </SortableList>
</main>

<style>
</style>
