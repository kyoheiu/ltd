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

  const normalColor = "#ACB0BE";
  const greenColor = "#40A02B";
  const yellowColor = "#DF8E1D";
  const redColor = "#D20F39";
  const archivedColor = "#5C5F77";

  interface Item {
    id: string;
    value: string;
    todo: boolean;
    dot: number;
  }

  let state = State.All;
  let original = [];
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
      original = items;
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
    console.log("Changing state...");
    state = newState;

    const res = await fetch("/item");
    if (!res.ok) {
      state = 5;
    }
    const j: Item[] = await res.json();
    original = [];
    items = [];
    archived = [];
    for (let i = 0; i < j.length; i++) {
      if (j[i].todo) {
        items.push(j[i]);
      } else {
        archived.push(j[i]);
      }
    }
    original = items;

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

  const updateState = (s: State) => {
    console.log("Updating state...");
    switch (s) {
      case State.All:
        items = original;
        break;
      case State.Green:
        items = original.filter((x) => x.dot == 1);
        break;
      case State.Yellow:
        items = original.filter((x) => x.dot == 2);
        break;
      case State.Red:
        items = original.filter((x) => x.dot == 3);
        break;
      case State.Archived:
        break;
      case State.NotLoggedIn:
        original = [];
        items = [];
        archived = [];
        break;
    }
  }

  const updateItems = async () => {
    const arr = original.concat(archived);
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
  };

  function dotColor(dot: number): string {
    let color = "";
    switch (dot) {
      case 1:
        color = greenColor;
        break;
      case 2:
        color = yellowColor;
        break;
      case 3:
        color = redColor;
        break;
      case 4:
        color = archivedColor;
        break;
      default:
        color = normalColor;
        break;
    }
    return color;
  }

  const changeColor = async (id: string) => {
    if (state == State.Archived) {
      console.log("Cannot change color of archived item.");
      return;
    }
    const i = original.findIndex((item) => item.id === id);
    if (original[i].dot === 3) {
      original[i].dot = 0;
    } else {
      original[i].dot += 1;
    }
    original = original;

    updateState(state);
    updateItems();
  };

  const addItem = async (value: string) => {
    console.log("item to add: " + value);
    const id = ulid();
    console.log(id);
    newItem = "";
    original.unshift({
      id: id,
      value: value,
      todo: true,
      dot: 0,
    });
    original = original;

    updateState(state);
    updateItems();
  };

  function toggleArchived(id: string) {
    let i: number;
    if (state == State.Archived) {
      i = archived.findIndex((item) => item.id == id);
      const target = archived[i];
      archived.splice(i, 1);
      original.unshift(target);
      original[0].todo = true;
    } else {
      i = original.findIndex((item) => item.id == id);
      const target2 = original[i];
      original.splice(i, 1);
      archived.unshift(target2);
      archived[0].todo = false;
    }
    original = original;
    archived = archived;

    updateState(state);
    updateItems();
  }

  const itemOrderChanged = async (event) => {
    console.log("item order changed.");
    const newTodo: Item[] = event.detail;
    original = newTodo;

    updateState(state);
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
        ><i
          class="ri-checkbox-blank-circle-fill"
          style="color: {normalColor}"
        /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Green)}
        ><i
          class="ri-checkbox-blank-circle-fill"
          style="color: {greenColor}"
        /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Yellow)}
        ><i
          class="ri-checkbox-blank-circle-fill"
          style="color: {yellowColor}"
        /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Red)}
        ><i
          class="ri-checkbox-blank-circle-fill"
          style="color: {redColor}"
        /></button
      >
      <button class="button-filter" on:click={() => changeState(State.Archived)}
        ><i
          class="ri-checkbox-blank-circle-fill"
          style="color: {archivedColor}"
        /></button
      >
    </nav>
    {#if state != State.Archived}
      <input type="text" bind:value={newItem} />
      <button on:click={() => addItem(newItem)}>add</button>
    {/if}
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
