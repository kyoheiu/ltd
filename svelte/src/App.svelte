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
    Archived,
    NotLogin,
  }

  interface Item {
    id: string;
    value: string;
    todo: boolean;
    dot: number;
  }

  let state = State.All;
  let items = [];
  onMount(async () => {
    const res = await fetch("/item");
    if (!res.ok) {
      console.log("Not verified: login form will appear.");
      state = 5;
    } else {
      state = 1;
      const j: Item[] = await res.json();
      items = j.filter((x) => x.todo);
    }
  });

 const logout = async () => {
    const res = await fetch("api/logout", {
      method: "POST"
    });
    console.log(res.status);
    window.location.reload();
 }

  const changeState = async (newState: State) => {
    state = newState;

    const res = await fetch("/item");
    if (!res.ok) {
      state = 5;
    }
    const j: Item[] = await res.json();
    switch (state) {
      case State.All:
        items = j.filter((x) => x.todo);
        break;
      case State.Green:
        items = j.filter((x) => x.dot == 1 && x.todo);
        break;
      case State.Yellow:
        items = j.filter((x) => x.dot == 2 && x.todo);
        break;
      case State.Red:
        items = j.filter((x) => x.dot == 3 && x.todo);
        break;
      case State.Archived:
        items = j.filter((x) => !x.todo);
        break;
      case State.NotLogin:
        items = [];
        break;
    }
  };

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
  };

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
        id: id,
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
    items = j.filter((x) => x.todo);
  };

  function toggleArchived(id: string) {
    const i = items.findIndex((item) => item.id === id);
    console.log(`item to toggle status: ${id} at ${i}`);
    items[i].todo = !items[i].todo;
    items.splice(i, 1);
    items = items;

    fetch("/item/archive", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
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
        swap: await diff(),
      }),
    });
    console.log(res.status);
  };

  function getItemById(id: string) {
    return items.find((item) => item.id === id);
  }
</script>

<main>
  {#if state == 5}
    <div class="title">ltd</div>
    <div>
      <form id="login-form" method="post" action="api/ldaplogin">
        <div>
          <input type="text" name="username" placeholder="DN" required />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="PASSWORD"
            required
          />
        </div>
        <p>
          <button type="submit"> &nbsp;GO&nbsp; </button>
        </p>
      </form>
    </div>
  {:else}
    <div class="header">
      <div>ltd</div>
      <button on:click={logout}>logout</button>
    </div>
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
              <button on:click={() => toggleArchived(item.id)}>archive</button>
        <button
          class="button-dot"
          style="color: {dotColor(item.dot)}"
          on:click={() => changeColor(item.id)}>●</button
        >
      </SortableList>
    {:else}
      <ul>
        {#each items as item}
          <li>
            {item.value}
            {#if state != 4}
              <button on:click={() => toggleArchived(item.id)}>archive</button>
            {:else}
              <button on:click={() => toggleArchived(item.id)}>unarchive</button>
            {/if}
            <button
              class="button-dot"
              style="color: {dotColor(item.dot)}"
              on:click={() => changeColor(item.id)}>●</button
            >
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</main>
