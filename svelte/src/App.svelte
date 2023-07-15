<script lang="ts">
  import logo from "./assets/logo.png";
  import "./app.css";
  import "remixicon/fonts/remixicon.css";
  import { onMount } from "svelte";
  import { ulid } from "ulid";
  import SortableList from "./lib/SortableList.svelte";
  import DialogToRename from "./lib/DialogToRename.svelte";
  import Login from "./lib/Login.svelte";
  import ItemRenamable from "./lib/ItemRenamable.svelte";
  import {
    defaultColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./lib/Color.ts";
  import { State } from "./lib/types.ts";
  import type { Item, ItemsWithModified } from "./lib/types.ts";
  import Nav from "./lib/Nav.svelte";
  import DialogToDelete from "./lib/DialogToDelete.svelte";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Footer from "./lib/Footer.svelte";
  import { SvelteToast, toast } from '@zerodevx/svelte-toast'

  // Optionally set default options here
  const options = {
      theme: {
    '--toastColor': "#24273A",
    '--toastBackground': '#e2e8f0',
    '--toastBarHeight': 0
  },
  reversed: true,
  intro: {y: 40}
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const reloadForced = urlParams.has('forced');

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
  let modified = 0;
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
      const j: ItemsWithModified = await res.json();
      for (let i = 0; i < j.items.length; i++) {
        if (j.items[i].todo) {
          items.push(j.items[i]);
        } else {
          archived.push(j.items[i]);
        }
      }
      items = items;
      archived = archived;
      modified = j.modified;

      if (reloadForced) {
        toast.push("Item list reloaded: Must be up-to-date to sort.");
      }
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
    const res = await fetch("/api/item/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: arr,
      }),
    });
    return res;
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
      const _res = await fetch(
        `/api/item?toggle_dot=${archived[i].dot}&id=${id}`,
        {
          method: "POST",
        }
      );
    } else {
      i = items.findIndex((item) => item.id === id);
      if (items[i].dot === 3) {
        items[i].dot = 0;
      } else {
        items[i].dot += 1;
      }
      items = items;
      const _res = await fetch(
        `/api/item?toggle_dot=${items[i].dot}&id=${id}`,
        {
          method: "POST",
        }
      );
    }
  };

  const toggleArchived = async (id: string) => {
    let i: number;
    if (state == State.Archived) {
      i = archived.findIndex((item) => item.id == id);
      const target = archived[i];
      archived.splice(i, 1);
      items.unshift(target);
      items[0].todo = true;
      items = items;
      archived = archived;
      const _res = await fetch(`/api/item?toggle_todo=1&id=${id}`, {
        method: "POST",
      });
    } else {
      i = items.findIndex((item) => item.id == id);
      const target2 = items[i];
      items.splice(i, 1);
      archived.unshift(target2);
      archived[0].todo = false;
      items = items;
      archived = archived;
      const _res = await fetch(`/api/item?toggle_todo=0&id=${id}`, {
        method: "POST",
      });
    }
  };

  const itemOrderChanged = async (event) => {
    const resForModifiedTime = await fetch("/api/check");
    const j = await resForModifiedTime.json();
    const modifiedBackend = j.modified;
    if (modified !== modifiedBackend) {
      window.location.assign("/?forced");
      return;
    } else {
    const newTodo: Item[] = event.detail;
      const res = await sortItems();
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const json = await res.json();
        if (json) {
          items = json.concat(items);
        }
      } else {
        items = newTodo;
      }
    }
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

<SvelteToast {options} />
<div class="wrap" />
<main>
  {#if state == State.NotLoggedIn}
    <Login />
  {:else}
    <div class="flex h-screen flex-col">
      <div class="mx-6 mb-4 mt-4 flex flex-col space-y-4">
        <div class="flex items-center justify-between">
          <a href="/"><img src={logo} alt="ltd" class="h-auto w-5" /></a>
          <button on:click={logout}
            ><i class="ri-logout-circle-r-line text-slate-200" /></button
          >
        </div>

        <div class="mx-2 flex items-center justify-center space-x-2">
          <input
            id="submit-form"
            class="w-full rounded-full bg-slate-200 px-2 py-1 text-slate-800"
            type="text"
            bind:value={newItem}
            on:keydown={(e) => e.key === "Enter" && addItem(newItem)}
            placeholder="+"
          />
        </div>

        <Nav {state} {changeState} />
      </div>

      {#if state == State.All}
        <div class="flex-grow">
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
              class="m-auto flex w-5/6 items-center space-x-2 rounded-md border-2 border-slate-200 p-2 text-slate-200"
            >
              <button
                on:click={() => !item.showModal && toggleArchived(item.id)}
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
        </div>
        <div class="flex justify-center">
          <Footer />
        </div>
      {:else if state != State.Archived}
        <div class="flex-grow">
          <ul class="flex flex-col space-y-2">
            {#each items.filter((x) => x.dot === state - 1) as item, index (item)}
              <label
                in:receive={{ key: item.id }}
                animate:flip={{ duration: 100 }}
                class="m-auto flex w-5/6 items-center space-x-2 rounded-md border-2 border-slate-200 p-2 text-slate-200"
              >
                <button
                  on:click={() => !item.showModal && toggleArchived(item.id)}
                  ><i class="ri-checkbox-blank-fill" /></button
                >
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="line-clamp-2 flex-auto cursor-pointer break-all"
                  on:click={() => (item.showModal = true)}
                >
                  {item.value}
                </div>
                <DialogToRename bind:item bind:showModal={item.showModal} />

                <button
                  style="color: {dotColor(item.dot)}; margin-left: auto"
                  on:click={() => changeColor(item.id)}
                  ><i class="ri-checkbox-blank-circle-fill" /></button
                >
              </label>
            {/each}
          </ul>
        </div>
        <div class="flex justify-center">
          <Footer />
        </div>
      {:else}
        <div class="flex-grow">
          <div class="mb-4 flex flex-col">
            <button
              class="m-auto rounded-full border border-rose-500 px-2 text-sm text-rose-500 hover:bg-rose-500 hover:text-slate-200"
              on:click={() => (showDialog = true)}
              ><i class="ri-delete-bin-2-fill" /> Delete all archived items</button
            >
            <DialogToDelete bind:showDialog />
          </div>
          <ul class="flex flex-col space-y-2">
            {#each archived as item, _index (item)}
              <li
                in:receive={{ key: item.id }}
                animate:flip={{ duration: 100 }}
                class="m-auto flex w-5/6 space-x-2 rounded-md border-2 border-slate-200 p-2 text-slate-200"
              >
                <button on:click={() => toggleArchived(item.id)}
                  ><i class="ri-checkbox-fill" /></button
                >
                <div class="line-clamp-2 flex-auto break-all">{item.value}</div>
                <button
                  style="color: {dotColor(item.dot)}; margin-left: auto"
                  on:click={() => changeColor(item.id)}
                  ><i class="ri-checkbox-blank-circle-fill" /></button
                >
              </li>
            {/each}
          </ul>
        </div>
        <div class="flex justify-center">
          <Footer />
        </div>
      {/if}
    </div>
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
