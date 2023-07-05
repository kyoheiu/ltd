<script lang="ts">
  import logo from "./assets/logo.png";
  import "./app.css";
  import "remixicon/fonts/remixicon.css";
  import { onMount } from "svelte";
  import { ulid } from "ulid";
  import SortableList from "./lib/SortableList.svelte";
  import Modal from "./lib/Modal.svelte";
  import Login from "./lib/Login.svelte";
  import Rename from "./lib/Rename.svelte";
  import ItemRenamable from "./lib/ItemRenamable.svelte";
  import {
    defaultColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./lib/Color.ts";
  import { State } from "./lib/types.ts";
  import type { Item } from "./lib/types.ts";
  import Nav from "./lib/Nav.svelte";
  import Dialog from "./lib/Dialog.svelte";
  import DeleteArchived from "./lib/DeleteArchived.svelte";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  // Animation when adding/archiving/unarchiving item
  const [_send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, _params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 100,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  let state = State.All;
  let items = [];
  let archived = [];
  let newItem = "";
  let showDialog = false;

  onMount(async () => {
    const res = await fetch("/api/item");
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

  // for testing
  // onMount(() => {
  //   items = [
  //     {
  //       id: "1",
  //       value: "milk",
  //       todo: true,
  //       dot: 0,
  //     },
  //     {
  //       id: "2",
  //       value: "orange",
  //       todo: true,
  //       dot: 0,
  //     },
  //     {
  //       id: "3",
  //       value: "banana",
  //       todo: true,
  //       dot: 0,
  //     },
  //     {
  //       id: "4",
  //       value: "apple",
  //       todo: true,
  //       dot: 0,
  //     },
  //     {
  //       id: "5",
  //       value: "watermelon",
  //       todo: true,
  //       dot: 0,
  //     },
  //   ];
  // });

  const logout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });
    window.location.reload();
  };

  const changeState = async (newState: State) => {
    state = newState;
  };

  const sortItems = async () => {
    const arr = items.concat(archived);
    const _res = await fetch("/api/item/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: arr,
      }),
    });
  };

  const dotColor = (dot: number): string => {
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
        color = defaultColor;
        break;
    }
    return color;
  };

  const addItem = async (value: string) => {
    if (newItem.trim() === "") {
      return;
    }
    const id = ulid();
    newItem = "";
    let dot = state - 1;
    if (state == State.Archived) {
      dot = 0;
    } else if (dot == -1) {
      dot = 0;
    }
    items.unshift({
      id: id,
      value: value,
      todo: true,
      dot: dot,
    });

    items = items;

    const _res = await fetch(
      `/api/item?add=true&id=${id}&value=${value}&dot=${dot}`,
      {
        method: "POST",
      }
    );
  };

  const changeColor = async (id: string) => {
    let i: number;
    if (state == State.Archived) {
      i = archived.findIndex((item) => item.id === id);
      if (archived[i].dot === 3) {
        archived[i].dot = 0;
      } else {
        archived[i].dot += 1;
      }
      archived = archived;
    } else {
      i = items.findIndex((item) => item.id === id);
      if (items[i].dot === 3) {
        items[i].dot = 0;
      } else {
        items[i].dot += 1;
      }
      items = items;
    }
    const _res = await fetch(`/api/item?toggle_dot=true&id=${id}`, {
      method: "POST",
    });
  };

  const toggleArchived = async (id: string) => {
    let i: number;
    if (state == State.Archived) {
      i = archived.findIndex((item) => item.id == id);
      const target = archived[i];
      archived.splice(i, 1);
      items.unshift(target);
      items[0].todo = true;
    } else {
      i = items.findIndex((item) => item.id == id);
      const target2 = items[i];
      items.splice(i, 1);
      archived.unshift(target2);
      archived[0].todo = false;
    }
    items = items;
    archived = archived;

    const _res = await fetch(`/api/item?toggle_archived=true&id=${id}`, {
      method: "POST",
    });
  };

  const itemOrderChanged = async (event) => {
    const newTodo: Item[] = event.detail;
    items = newTodo;

    sortItems();
  };

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  const sortableOptions = {
    group: "items",
    animation: 100,
    easing: "cubic-bezier(1, 0, 0, 1)",
  };
</script>

<div class="wrap" />
<main>
  {#if state == State.NotLoggedIn}
    <Login />
  {:else}
    <div class="flex flex-col space-y-4 mx-6 mb-4 mt-4">
      <div class="flex justify-between items-center">
        <a href="/"><img src={logo} alt="ltd" class="w-5 h-auto" /></a>
        <button on:click={logout}
          ><i class="ri-logout-circle-r-line text-slate-200" /></button
        >
      </div>

      <div class="flex justify-center items-center mx-2 space-x-2">
        <input
          id="submit-form"
          class="text-slate-800 bg-slate-200 rounded-full py-1 px-2 w-full"
          type="text"
          bind:value={newItem}
          on:keydown={(e) => e.key === "Enter" && addItem(newItem)}
          placeholder="+"
        />
      </div>

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
        ulClass="flex flex-col space-y-2 mb-4"
      >
        <label
          in:receive={{ key: item.id }}
          class="text-slate-200 flex items-center space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
        >
          <button on:click={() => !item.showModal && toggleArchived(item.id)}
            ><i class="ri-checkbox-blank-fill" /></button
          >
          <ItemRenamable {item} />
          <i
            class="ri-drag-move-fill"
            style="margin-left: auto; cursor: move"
          />
          &nbsp;
          <button
            style="color: {dotColor(item.dot)}"
            on:click={() => changeColor(item.id)}
            ><i class="ri-checkbox-blank-circle-fill" /></button
          >
        </label>
      </SortableList>
    {:else if state != State.Archived}
      <ul class="flex flex-col space-y-2 mb-4">
        {#each items.filter((x) => x.dot === state - 1) as item, index (item)}
          <label
            in:receive={{ key: item.id }}
            animate:flip={{ duration: 100 }}
            class="text-slate-200 flex items-center space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
          >
            <button on:click={() => !item.showModal && toggleArchived(item.id)}
              ><i class="ri-checkbox-blank-fill" /></button
            >
            <!-- svelte-ignore a11y-click-events-have-key-events -->
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
              on:click={() => changeColor(item.id)}
              ><i class="ri-checkbox-blank-circle-fill" /></button
            >
          </label>
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
      <ul class="flex flex-col space-y-2 mb-4">
        {#each archived as item, _index (item)}
          <li
            in:receive={{ key: item.id }}
            animate:flip={{ duration: 100 }}
            class="text-slate-200 flex space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
          >
            <button on:click={() => toggleArchived(item.id)}
              ><i class="ri-checkbox-fill" /></button
            >
            <div class="flex-auto break-all line-clamp-2">{item.value}</div>
            <button
              style="color: {dotColor(item.dot)}; margin-left: auto"
              on:click={() => changeColor(item.id)}
              ><i class="ri-checkbox-blank-circle-fill" /></button
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
