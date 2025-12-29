<script lang="ts">
  import { get } from "svelte/store";
  import Footer from "./Footer.svelte";
  import ItemRenamable from "./ItemRenamable.svelte";
  import { state } from "./stores";
  import type { ItemsWithModifiedTime } from "./types";
  import { receive } from "./Animation";
  import { toggleArchived } from "./toggle";
  import { flip } from "svelte/animate";
  import Dot from "./Dot.svelte";
  import IconSquare from "@tabler/icons-svelte/dist/svelte/icons/IconSquare.svelte";
  import IconGripVertical from "@tabler/icons-svelte/dist/svelte/icons/IconGripVertical.svelte";
  import Sortable from "sortablejs";
  import { onMount } from "svelte";

  const sortItems = async (oldIndex: number, newIndex: number) => {
    const res = await fetch("/api/item/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old: oldIndex,
        new: newIndex,
      }),
    });
    const j: ItemsWithModifiedTime = await res.json();
    let items = [];
    let archived = [];
    for (let i = 0; i < j.items.length; i++) {
      if (j.items[i].todo) {
        items.push(j.items[i]);
      } else {
        archived.push(j.items[i]);
      }
    }

    state.update((s) => {
      return {
        ...s,
        items: items,
        archived: archived,
        modified: j.modified,
      };
    });
  };

  const itemOrderChanged = async (event) => {
    const resForModifiedTime = await fetch("/api/check");
    const j = await resForModifiedTime.json();
    if (get(state).modified !== j.modified) {
      window.location.reload();
      return;
    } else {
      await sortItems(event.oldIndex, event.newIndex);
    }
  };
  onMount(() => {
    const el = window.document.getElementById("items");
    Sortable.create(el, {
      animation: 100,
      delay: 100,
      ghostClass: "invisible",
      dragClass: "opacity-100",
      easing: "cubic-bezier(1, 0, 0, 1)",
      onUpdate: itemOrderChanged,
    });
    const ws = new WebSocket("http://localhost:8080/ws");
    // Connection opened
    ws.addEventListener("open", (event) => {
      console.log("Connected to echo server");

      // Send a test message
      ws.send("Hello, WebSocket Echo Server!");

      // Send JSON data
      ws.send(
        JSON.stringify({
          type: "test",
          timestamp: Date.now(),
          message: "Testing echo functionality",
        })
      );
    });
  });
</script>

<div class="flex-grow">
  <ul class="flex flex-col space-y-2" id="items">
    {#each $state.items as item, _index (item)}
      <li
        id={item.id}
        in:receive={{ key: item.id }}
        animate:flip={{ duration: 100 }}
        class="m-auto flex w-4/5 items-center space-x-2 rounded-md border-2 border-foreground p-2 text-foreground sm:w-80"
      >
        <button on:click={() => !item.showModal && toggleArchived(item.id)}
          ><IconSquare /></button
        >
        <ItemRenamable {item} />
        <div class="w-4">
          <IconGripVertical class="ml-auto cursor-move" />
        </div>
        &nbsp;
        <Dot {item} />
      </li>
    {/each}
  </ul>
</div>
<div class="flex justify-center">
  <Footer />
</div>
