<script lang="ts">
  import { get } from "svelte/store";
  import { state } from "./stores";
  import logo from "../assets/logo.png";
  import { ulid } from "ulid";
  import Nav from "./Nav.svelte";
  import { ICON_SIZE, Page } from "./types";
  import IconLogout from "@tabler/icons-svelte/dist/svelte/icons/IconLogout.svelte";

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

<div class="mb-4 mt-6 flex flex-col items-center justify-center space-y-4">
  <div class="flex w-52 items-center justify-between sm:w-80">
    <a href="/"><img src={logo} alt="ltd" class="h-auto w-5" /></a>
    <button on:click={logout} class="ml-auto"
      ><IconLogout size={ICON_SIZE} /></button
    >
  </div>

  <input
    id="submit-form"
    class="mx-2 rounded-full bg-foreground px-4 py-1 text-background"
    type="text"
    bind:value={$state.newItem}
    on:keydown={(e) => e.key === "Enter" && addItem()}
    placeholder="+"
  />
  <Nav />
</div>
