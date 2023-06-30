<script lang="ts">
  import "./app.css";
  import { onMount } from "svelte";
  import SortableList from "@palsch/svelte-sortablejs";
  import { ulid } from "ulid";
  import "remixicon/fonts/remixicon.css";
  import Modal from "./Modal.svelte";
  import Login from "./Login.svelte";
  import Rename from "./Rename.svelte";
  import ItemRenamable from "./ItemRenamable.svelte";
  import {
    normalColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./Color.ts";
  import { State } from "./types.ts";
  import type { Item } from "./types.ts";
  import Nav from "./Nav.svelte";

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
  };

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
    group: "items",
    animation: 100,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };
</script>

<main>
  {#if state == State.NotLoggedIn}
    <Login />
  {:else}
    <div class="flex flex-col space-y-4 mx-4 mb-4">
      <div class="flex justify-between mx-2">
        <a href="/" class="text-slate-200">ltd</a>
        <button class="text-slate-200" on:click={logout}
          ><i class="ri-logout-circle-r-line" /></button
        >
      </div>

      {#if state != State.Archived}
        <div class="flex justify-center items-center space-x-1">
          <div>
            <input class="rounded-md p-1" type="text" bind:value={newItem} />
          </div>
          <div>
            <button
              class="text-slate-200 rounded-md border-2"
              on:click={() => addItem(newItem)}
              >&nbsp;<i class="ri-add-line" />&nbsp;</button
            >
          </div>
        </div>
      {/if}

      <Nav {changeState} />
    </div>

    {#if state == State.All}
      <SortableList
        {sortableOptions}
        on:orderChanged={itemOrderChanged}
        bind:items
        let:item
        idKey="id"
        {getItemById}
        ulClass="flex flex-col space-y-2"
        liClass="text-slate-200 flex space-x-2 m-auto p-2 border-2 rounded-md w-5/6"
      >
        <button on:click={() => toggleArchived(item.id)}
          ><i class="ri-checkbox-blank-fill" /></button
        >
        <ItemRenamable {item} />
        <i class="ri-drag-move-fill" style="margin-left: auto; cursor: move" />
        <button
          style="color: {dotColor(item.dot)}"
          on:click={() => changeColor(item.id)}>●</button
        >
      </SortableList>
    {:else if state != State.Archived}
      <ul class="flex flex-col space-y-2">
        {#each items as item}
          <li
            class="text-slate-200 flex space-x-2 m-auto p-2 border-2 rounded-md w-5/6"
          >
            <button on:click={() => toggleArchived(item.id)}
              ><i class="ri-checkbox-blank-fill" /></button
            >

            <button on:click={() => (item.showModal = true)}
              >{item.value}</button
            >
            <Modal bind:showModal={item.showModal}>
              <Rename value={item.value} id={item.id} />
            </Modal>

            <button
              style="color: {dotColor(item.dot)}; margin-left: auto"
              on:click={() => changeColor(item.id)}>●</button
            >
          </li>
        {/each}
      </ul>
    {:else}
      <ul class="flex flex-col space-y-2">
        {#each archived as item}
          <li
            class="text-slate-200 flex space-x-2 m-auto p-2 border-2 rounded-md w-5/6"
          >
            <button on:click={() => toggleArchived(item.id)}
              ><i class="ri-checkbox-fill" /></button
            >
            <button>{item.value}</button>
            <button
              style="color: {dotColor(item.dot)}; margin-left: auto"
              on:click={() => changeColor(item.id)}>●</button
            >
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</main>
