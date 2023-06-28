<script lang="ts">
  import { onMount } from "svelte";
  import SortableList from "@palsch/svelte-sortablejs";
  import { ulid } from "ulid";
  import "remixicon/fonts/remixicon.css";

  enum State {
    All,
    Green,
    Yellow,
    Red,
    Archived,
    NotLoggedIn,
  }

  interface Item {
    id: string;
    value: string;
    todo: boolean;
    dot: number;
  }

  let state = State.All;
  let items = [];
  let archived = [];
  let newItem = "";

  onMount(async () => {
    const res = await fetch("/item");
    if (!res.ok) {
      console.log("Not verified: login form will appear.");
      state = State.NotLoggedIn;
    } else {
      state = State.All;
      const j: Item[] = await res.json();
      for (let i = 0; i < j.length; i++) {
        if (j[i].todo) {
          items.push(j[i]);
        } else {
          archived.push(j[i]);
        }
      }
      items = items;
      archived = archived;
    }
  });

  const logout = async () => {
    const res = await fetch("api/logout", {
      method: "POST",
    });
    console.log(res.status);
    window.location.reload();
  };

  const changeState = async (newState: State) => {
    state = newState;

    const res = await fetch("/item");
    if (!res.ok) {
      state = 5;
    }
    const j: Item[] = await res.json();
    items = [];
    archived = [];
    for (let i = 0; i < j.length; i++) {
      if (j[i].todo) {
        items.push(j[i]);
      } else {
        archived.push(j[i]);
      }
    }

    switch (state) {
      case State.All:
        items = items;
        break;
      case State.Green:
        items = items.filter((x) => x.dot == 1);
        break;
      case State.Yellow:
        items = items.filter((x) => x.dot == 2);
        break;
      case State.Red:
        items = items.filter((x) => x.dot == 3);
        break;
      case State.Archived:
        break;
      case State.NotLoggedIn:
        items = [];
        archived = [];
        break;
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

  const updateItems = async () => {
      const arr = items.concat(archived);
    const res = await fetch("/item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: arr,
      }),
    });
    console.log(res.status);
  }

  const changeColor = async (id: string) => {
    const i = items.findIndex((item) => item.id === id);
    console.log(`item to change color: ${id} at ${i}`);
    if (items[i].dot === 3) {
      items[i].dot = 0;
    } else {
      items[i].dot += 1;
    }
    items = items;

    updateItems();
  }

  const addItem = async (value: string) => {
    console.log("item to add: " + value);
    const id = ulid();
    console.log(id);
    newItem = "";
    items.unshift({
      id: id,
      value: value,
      todo: true,
      dot: 0,
    });
    items = items;

    updateItems();
  };

  function toggleArchived(id: string) {
    let i: number;
    if (state == State.Archived) {
      i = archived.findIndex((item) => item.id == id);
      const target = archived[i];
      archived.slice(i, 1);
      items.unshift(target);
    } else {
      i = items.findIndex((item) => item.id == id);
      const target = items[i];
      items.slice(i, 1);
      archived.unshift(target);
    }
    items = items;
    archived = archived;

    updateItems();
  }

  const itemOrderChanged = async (event) => {
    console.log("item order changed.");
    const newTodo: Item[] = event.detail;
    items = newTodo;

    updateItems();
  };

  function getItemById(id: string) {
    return items.find((item) => item.id === id);
  }

  const sortableOptions = {
    group: "todo",
    animation: 100,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };

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
      <button on:click={logout}><i class="ri-logout-box-r-fill" /></button>
    </div>
    <nav>
      <button class="button-filter" on:click={() => changeState(State.All)}
        ><i class="ri-checkbox-blank-circle-fill" /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Green)}
        ><i class="ri-checkbox-blank-circle-fill" /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Yellow)}
        ><i class="ri-checkbox-blank-circle-fill" /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Red)}
        ><i class="ri-checkbox-blank-circle-fill" /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Archived)}
        ><i class="ri-checkbox-blank-circle-fill" /></button
      >
    </nav>
    <input type="text" bind:value={newItem} />
    <button on:click={() => addItem(newItem)}>add</button>
    {#if state == State.All}
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
    {:else if state != State.Archived}
      <ul>
        {#each items as item}
          <li>
            {item.value}
            <button on:click={() => toggleArchived(item.id)}>archive</button>
            <button
              class="button-dot"
              style="color: {dotColor(item.dot)}"
              on:click={() => changeColor(item.id)}>●</button
            >
          </li>
        {/each}
      </ul>
    {:else}
      <ul>
        {#each archived as item}
          <li>
            {item.value}
            <button on:click={() => toggleArchived(item.id)}>unarchive</button>
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
