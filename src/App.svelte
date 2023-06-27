<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
import SortableList from '@palsch/svelte-sortablejs';
import {ulid} from "ulid";

  let items = [
    {
      "id": "1",
      "value": "milk"
    },
    {
      "id": "2",
      "value": "orange"
    },
    {
      "id": "3",
      "value": "apple"
    },
    {
      "id": "4",
      "value": "fish"
    },
  ];

  let items2 = [
    {
      "id": "1",
      "value": "milk"
    },
    {
      "id": "2",
      "value": "orange"
    },
    {
      "id": "3",
      "value": "apple"
    },
    {
      "id": "4",
      "value": "fish"
    },
  ];

    let newItem = "";

  const sortableOptions = {
        group: "items", 
        animation: 100, 
        easing: "cubic-bezier(1, 0, 0, 1)"
    };

    function addItem(value: string) {
      console.log(value);
      items.unshift({
        "id": ulid(),
        "value" : value
      });
      items = items;
    }

    function itemOrderChanged(event) {
        console.log("item order changed!", event.detail);
    }

    function getItemById(id) {
        return items.concat(items2).find(item => item.id == id);
    }
</script>

<main>
  <h1>Yet another todo app.</h1>
    <input type="text" bind:value={newItem}/>
    <button on:click={() => addItem(newItem)}>add</button>
  <SortableList { sortableOptions } on:orderChanged={ itemOrderChanged } 
        bind:items idKey="id" let:item { getItemById }>
    { item.value }
    <input type="checkbox" />
</SortableList>
</main>

<style>
</style>
