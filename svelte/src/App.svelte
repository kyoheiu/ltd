<script lang="ts">
  import { onMount } from "svelte";
  import SortableList from "@palsch/svelte-sortablejs";
  import { ulid } from "ulid";
    import { writable } from "svelte/store";
    import { construct_svelte_component } from "svelte/internal";

  enum State {
    All,
    Green,
    Yellow,
    Red,
    Archived
  }

  interface Item {
    id: string;
    value: string;
    todo: boolean;
    dot: number
  }

  let state =State.All;
  let items = [];
  onMount(async () => {
    const res = await fetch("/item");
    const j: Item[] = await res.json();
    items = j.filter(x => x.todo);
  });

  const changeState = async (newState: State) => {
    state = newState;

    const res = await fetch("/item");
    const j: Item[] = await res.json();
    switch (state) {
      case State.All:
    items = j.filter(x => x.todo);
        break;
      case State.Green:
        items = j.filter(x => x.dot == 1 && x.todo);
        break;
      case State.Yellow:
        items = j.filter(x => x.dot == 2 && x.todo);
        break;
      case State.Red:
        items = j.filter(x => x.dot == 3 && x.todo);
        break;
      case State.Archived:
        items = j.filter(x => !x.todo);
        break;
    }
  }

  const diff = async (): Promise<string[]> => {
    let result = [];
    if (items.length == 0) {
      return result;
    } else {
      const res = await fetch("/item");
      const old: Item[] = await res.json();
    for (let i = 0; i < items.length; i++) {
      if (items[i].id != old[i].id) {
        result.push(items[i].id);
        result.push(old[i].id);
        return result;
      }
    }
    return [];
    }
  }

  function dotColor(dot: number): string {
    let color = "";
    switch (dot) {
      case 1:
        color = "green";
        break;
      case 2:
        color = "yellow";
        break;
      case 3:
        color = "red";
        break;
      default:
        color = "black";
        break;
    }
    return color;
  }

  let newItem = "";

  const sortableOptions = {
    group: "items",
    animation: 100,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };

  function changeColor(id: string) {
    const i = items.findIndex((item) => item.id === id);
    console.log(`item to change color: ${id} at ${i}`);
    if (items[i].dot === 3) {
      items[i].dot = 0;
    } else {
      items[i].dot += 1;
    }
    items = items;

    fetch("/item/dot", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then((res) => {
      console.log(res.status);
    });
  }

  const addItem = async (value: string) => {
    console.log("item to add: " + value);
    const id = ulid();
    console.log(id);
    newItem = "";

    const res = await fetch("/item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        value: value,
      }),
    });
    console.log("UPDATE: " + res.status);

    const newItems = await fetch("/item");
    const j: Item[] = await newItems.json();
    items = j.filter(x => x.todo);
  }

  function archiveItem(id:string) {
    const i = items.findIndex((item) => item.id === id);
    console.log(`item to archive: ${id} at ${i}`)
    items[i].todo = false;
    items.splice(i, 1);
    items = items;

    fetch("/item/archive", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then((res) => {
      console.log(res.status);
    });
  }

  const itemOrderChanged = async () => {
    console.log("item order changed.");
    const res = await fetch("/item/swap", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        swap: await diff()
      }),
    });
    console.log(res.status);
  }

  function getItemById(id:string) {
    return items.find((item) => item.id === id);
  }
</script>

<main>
  <h1>ltd</h1>
  <nav>
    <button on:click={() => changeState(State.All)}>All</button>
    <button on:click={() => changeState(State.Green)}>Green</button>
    <button on:click={() => changeState(State.Yellow)}>Yellow</button>
    <button on:click={() => changeState(State.Red)}>Red</button>
    <button on:click={() => changeState(State.Archived)}>Archived</button>
  </nav>
  <input type="text" bind:value={newItem} />
  <button on:click={() => addItem(newItem)}>add</button>
  {#if state == 0}
  <SortableList
    {sortableOptions}
    on:orderChanged={itemOrderChanged}
    bind:items
    idKey="id"
    let:item
    {getItemById}
  >
    {item.value}
    {#if state != 4}
    <input type="checkbox" on:click={() => archiveItem(item.id)}/>
    {:else}
    <input type="checkbox" checked on:click={() => archiveItem(item.id)}/>
    {/if}
    <button class="button-dot" style="color: {dotColor(item.dot)}" on:click={() => changeColor(item.id)}>●</button>
  </SortableList>
  {:else}
  <ul>
  {#each items as item}
  <li>
    {item.value}
    {#if state != 4}
    <input type="checkbox" on:click={() => archiveItem(item.id)}/>
    {:else}
    <input type="checkbox" checked on:click={() => archiveItem(item.id)}/>
    {/if}
    <button class="button-dot" style="color: {dotColor(item.dot)}" on:click={() => changeColor(item.id)}>●</button>

    </li>
  {/each}
</ul>
  {/if}
</main>
