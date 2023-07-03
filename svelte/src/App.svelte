<script lang="ts">
  import "./app.css";
  import { onMount } from "svelte";
  import logo from "./assets/logo.png";
  import SortableList from "./lib/SortableList.svelte";
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
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
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

  // onMount(async () => {
  //   const res = await fetch("/item");
  //   if (!res.ok) {
  //     console.log("Not verified: login form will appear.");
  //     state = State.NotLoggedIn;
  //   } else {
  //     state = State.All;
  //     const j: Item[] = await res.json();
  //     for (let i = 0; i < j.length; i++) {
  //       if (j[i].todo) {
  //         items.push(j[i]);
  //       } else {
  //         archived.push(j[i]);
  //       }
  //     }
  //     original = items;
  //     items = items;
  //     archived = archived;
  //   }
  // });

  onMount(() => {
    items = [
      {
        id: "1",
        value: "milk",
        todo: true,
        dot: 0,
      },
      {
        id: "2",
        value: "orange",
        todo: true,
        dot: 0,
      },
      {
        id: "3",
        value: "banana",
        todo: true,
        dot: 0,
      },
      {
        id: "4",
        value: "apple",
        todo: true,
        dot: 0,
      },
      {
        id: "5",
        value: "watermelon",
        todo: true,
        dot: 0,
      },
    ];
  });

  const logout = async () => {
    const res = await fetch("api/logout", {
      method: "POST",
    });
    window.location.reload();
  };

  const changeState = async (newState: State) => {
    state = newState;
  };

  const updateItems = async () => {
    const arr = items.concat(archived);
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
    const i = items.findIndex((item) => item.id === id);
    if (items[i].dot === 3) {
      items[i].dot = 0;
    } else {
      items[i].dot += 1;
    }
    items = items;

    updateItems();
  };

  const addItem = async (value: string) => {
    if (newItem.trim() === "") {
      return;
    }
    const id = ulid();
    newItem = "";
    let dot = state;
    if (state == State.Archived) {
      dot = 0;
    }
    items.unshift({
      id: id,
      value: value,
      todo: true,
      dot: dot,
    });
    toastMsg("Added: " + value);

    items = items;

    updateItems();
  };

  function toggleArchived(id: string) {
    let i: number;
    if (state == State.Archived) {
      i = archived.findIndex((item) => item.id == id);
      const target = archived[i];
      archived.splice(i, 1);
      items.unshift(target);
      items[0].todo = true;
      toastMsg("Unarchived: " + target.value);
    } else {
      i = items.findIndex((item) => item.id == id);
      const target2 = items[i];
      items.splice(i, 1);
      archived.unshift(target2);
      archived[0].todo = false;
      toastMsg("Archived: " + target2.value);
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
        ulClass="flex flex-col space-y-2"
      >
        <label
          in:receive={{ key: item.id }}
          out:send={{ key: item.id }}
          class="text-slate-200 flex items-center space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
        >
          <button on:click={() => toggleArchived(item.id)}
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
      <ul class="flex flex-col space-y-2">
        {#each items.filter((x) => x.dot === state) as item, index (item)}
          <label
            in:receive={{ key: item.id }}
            out:send={{ key: item.id }}
            animate:flip={{ duration: 100 }}
            class="text-slate-200 flex items-center space-x-2 m-auto p-2 border-2 border-slate-200 rounded-md w-5/6"
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
      <ul class="flex flex-col space-y-2">
        {#each archived as item, index (item)}
          <li
            in:receive={{ key: item.id }}
            out:send={{ key: item.id }}
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
