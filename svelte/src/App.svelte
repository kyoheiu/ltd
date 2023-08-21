<script lang="ts">
  import "./app.css";
  import { onMount } from "svelte";
  import Login from "./lib/Login.svelte";
  import { Page } from "./lib/types.ts";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { readItem, state } from "./lib/stores.ts";
  import Header from "./lib/Header.svelte";
  import All from "./lib/All.svelte";
  import ItemColored from "./lib/ItemColored.svelte";
  import Archived from "./lib/Archived.svelte";

  // Optionally set default options here
  const options = {
    theme: {
      "--toastColor": "#24273A",
      "--toastBackground": "#e2e8f0",
      "--toastBarHeight": 0,
    },
    reversed: true,
    intro: { y: 40 },
  };

  onMount(async () => {
    readItem();
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
</script>

<SvelteToast {options} />
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

<style>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 2rem;
    --toastContainerLeft: calc(50vw - 8rem);
  }
</style>
