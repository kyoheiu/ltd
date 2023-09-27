<script lang="ts">
  import "./app.css";
  import { onMount } from "svelte";
  import Login from "./lib/Login.svelte";
  import { Page } from "./lib/types.ts";
  import { readItem, state } from "./lib/stores.ts";
  import Header from "./lib/Header.svelte";
  import All from "./lib/All.svelte";
  import ItemColored from "./lib/ItemColored.svelte";
  import Archived from "./lib/Archived.svelte";

  onMount(async () => {
    readItem();
  });

  // for demo
  // onMount(() => {
  //   const items = [
  //     {
  //       id: "1",
  //       value: "milk",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "2",
  //       value: "orange",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "3",
  //       value: "banana",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "4",
  //       value: "apple",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "5",
  //       value: "watermelon",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //   ];

  //   state.update((s) => {
  //     return {
  //       ...new State(),
  //       page: Page.All,
  //       items: items,
  //     };
  //   });
  // });
</script>

<div class="wrap" />
<main>
  {#if $state.page == Page.NotLoggedIn}
    <Login />
  {:else}
    <div class="m-auto flex h-screen flex-col">
      <Header />
      {#if $state.page == Page.All}
        <All />
      {:else if $state.page != Page.Archived}
        <ItemColored />
      {:else}
        <Archived />
      {/if}
    </div>
  {/if}
</main>