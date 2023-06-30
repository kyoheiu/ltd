<script>
  import {
    normalColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./Color.ts";
  import { State } from "./types.ts";

  export let changeState;
</script>

<nav class="flex justify-center space-x-4">
  <button class="button-filter" on:click={() => changeState(State.All)}
    ><i
      class="ri-checkbox-blank-circle-fill"
      style="color: {normalColor}"
    /></button
  >
  <button class="button-filter" on:click={() => changeState(State.Green)}
    ><i
      class="ri-checkbox-blank-circle-fill"
      style="color: {greenColor}"
    /></button
  >
  <button class="button-filter" on:click={() => changeState(State.Yellow)}
    ><i
      class="ri-checkbox-blank-circle-fill"
      style="color: {yellowColor}"
    /></button
  >
  <button class="button-filter" on:click={() => changeState(State.Red)}
    ><i
      class="ri-checkbox-blank-circle-fill"
      style="color: {redColor}"
    /></button
  >
  <button class="button-filter" on:click={() => changeState(State.Archived)}
    ><i
      class="ri-checkbox-blank-circle-fill"
      style="color: {archivedColor}"
    /></button
  >
</nav>
