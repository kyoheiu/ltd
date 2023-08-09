<script lang="ts">
  import { get } from "svelte/store";
  import { state } from "./stores";
  import logo from "../assets/logo.png";
  import { ulid } from "ulid";
  import Nav from "./Nav.svelte";
  import { Page } from "./types";

  const addItem = async () => {
    const currentState = get(state);
    if (currentState.newItem.trim() === "") {
      return;
    }
    const id = ulid();
    let dot = currentState.page - 1;
    if (currentState.page == Page.Archived || dot === -1) {
      dot = 0;
    }
    let items = currentState.items;
    items.unshift({
      id: id,
      value: currentState.newItem,
      todo: true,
      dot: dot,
      showModal: false,
    });

    const res = await fetch(
      `/api/item?add=true&id=${id}&value=${currentState.newItem}&dot=${dot}`,
      {
        method: "POST",
      }
    );
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
        items: items,
        newItem: "",
        modified: j.modified,
      };
    });
  };
  const logout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });
    window.location.reload();
  };
</script>

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
      bind:value={$state.newItem}
      on:keydown={(e) => e.key === "Enter" && addItem()}
      placeholder="+"
    />
  </div>

  <Nav />
</div>
