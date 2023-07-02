<script lang="ts">
  import "./app.css";
  import { onMount } from "svelte";
  import logo from "./assets/logo.png";
  import SortableList from "@palsch/svelte-sortablejs";
  import { ulid } from "ulid";
  import "remixicon/fonts/remixicon.css";
  import Modal from "./lib/Modal.svelte";
  import Login from "./lib/Login.svelte";
  import Rename from "./lib/Rename.svelte";
  import ItemRenamable from "./lib/ItemRenamable.svelte";
  import {
    normalColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./lib/Color.ts";
  import { State } from "./lib/types.ts";
  import type { Item } from "./lib/types.ts";
  import Nav from "./lib/Nav.svelte";
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";
  import Dialog from "./lib/Dialog.svelte";
  import DeleteArchived from "./lib/DeleteArchived.svelte";
  import { toastMsg } from "./lib/Toast.ts";

  let state = State.All;
  let original = [];
  let items = [];
  let archived = [];
  let newItem = "";
  let showDialog = false;

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
    window.location.reload();
  };

  const changeState = async (newState: State) => {
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
    const _res = await fetch("/item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: arr,
      }),
    });
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
      toastMsg("Cannot change color of archived item.");
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

  const addItem = async (event, value: string) => {
    event.preventDefault();
    if (newItem.trim() === "") {
      return;
    }
    const id = ulid();
    newItem = "";
    let dot = state;
    if (state == State.Archived) {
      dot = 0;
    }
    original.unshift({
      id: id,
      value: value,
      todo: true,
      dot: dot,
    });
    toastMsg("Added: " + value);

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
      toastMsg("Unarchived: " + target.value);
    } else {
      i = original.findIndex((item) => item.id == id);
      const target2 = original[i];
      original.splice(i, 1);
      archived.unshift(target2);
      archived[0].todo = false;
      toastMsg("Archived: " + target2.value);
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

<div class="wrap">
<SvelteToast options={{ reversed: true }} />
</div>
<main>
  {#if state == State.NotLoggedIn}
    <Login />
  {:else}
    <div class="flex flex-col space-y-4 mx-6 mb-4 mt-4">
      <div class="flex justify-between items-center">
        <a href="/"
          ><img src={logo} alt="ltd" class="w-5 h-auto" /></a
        >
        <button on:click={logout}
          ><i class="ri-logout-circle-r-line text-slate-200" /></button
        >
      </div>

      <form class="flex justify-center items-center mx-2 space-x-2">
        <div>
          <input
            id="submit-form"
            class="text-slate-800 bg-slate-200 rounded-full py-1 px-2 w-full"
            type="text"
            bind:value={newItem}
          />
        </div>
        <div>
          <button
            id="submit-button"
            type="submit"
            class="text-sm text-slate-200 border-slate-200 hover:bg-slate-200 hover:text-neutral-800 rounded-md border-2"
            on:click={(event) => addItem(event, newItem)}
            >&nbsp;<i class="ri-add-line" />&nbsp;</button
          >
        </div>
      </form>

      <Nav {state} {changeState} />
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
        liClass="text-slate-200 flex items-center space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
      >
        <button on:click={() => toggleArchived(item.id)}
          ><i class="ri-checkbox-blank-fill" /></button
        >
        <ItemRenamable {item} />
        <i class="ri-drag-move-fill" style="margin-left: auto; cursor: move" />
        &nbsp;
        <button
          style="color: {dotColor(item.dot)}"
          on:click={() => changeColor(item.id)}><i class="ri-checkbox-blank-circle-fill"></i></button
        >
      </SortableList>
    {:else if state != State.Archived}
      <ul class="flex flex-col space-y-2">
        {#each items as item}
          <li
            class="text-slate-200 flex space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
          >
            <button on:click={() => toggleArchived(item.id)}
              ><i class="ri-checkbox-blank-fill" /></button
            >
            <div
              class="flex-auto break-all line-clamp-2 cursor-pointer"
              on:click={() => (item.showModal = true)}
            >
              {item.value}
            </div>
            <Modal bind:showModal={item.showModal}>
              <Rename value={item.value} id={item.id} />
            </Modal>

            <button
              style="color: {dotColor(item.dot)}; margin-left: auto"
              on:click={() => changeColor(item.id)}><i class="ri-checkbox-blank-circle-fill"></i></button
            >
          </li>
        {/each}
      </ul>
    {:else}
      <div class="flex flex-col my-6">
        <button
          class="text-sm text-red border-red hover:bg-red hover:text-slate-50 rounded-md border-2 m-auto px-2"
          on:click={() => (showDialog = true)}
          ><i class="ri-delete-bin-2-fill" /> Delete all archived items</button
        >
        <Dialog bind:showDialog>
          <DeleteArchived />
        </Dialog>
      </div>
      <ul class="flex flex-col space-y-2">
        {#each archived as item}
          <li
            class="text-slate-200 flex space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
          >
            <button on:click={() => toggleArchived(item.id)}
              ><i class="ri-checkbox-fill" /></button
            >
            <div class="flex-auto break-all line-clamp-2">{item.value}</div>
            <button
              style="color: {dotColor(item.dot)}; margin-left: auto"
              on:click={() => changeColor(item.id)}><i class="ri-checkbox-blank-circle-fill"></i></button
            >
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</main>

<style>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 2rem;
    --toastContainerLeft: calc(50vw - 8rem);
  }
</style>
