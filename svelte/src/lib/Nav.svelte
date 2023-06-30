<script>
  import {
    normalColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./Color.ts";
  import { State } from "./types.ts";

  export let state;
  export let changeState;
</script>

<nav class="flex justify-center space-x-4">
  {#if state == State.All}
    <button
      class="button-filter border-b"
      on:click={() => changeState(State.All)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {normalColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(State.All)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {normalColor}"
      /></button
    >
  {/if}
  {#if state == State.Green}
    <button
      class="button-filter border-b"
      on:click={() => changeState(State.Green)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {greenColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(State.Green)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {greenColor}"
      /></button
    >
  {/if}
  {#if state == State.Yellow}
    <button
      class="button-filter border-b"
      on:click={() => changeState(State.Yellow)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {yellowColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(State.Yellow)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {yellowColor}"
      /></button
    >
  {/if}
  {#if state == State.Red}
    <button
      class="button-filter border-b"
      on:click={() => changeState(State.Red)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {redColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(State.Red)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {redColor}"
      /></button
    >
  {/if}
  {#if state == State.Archived}
    <button
      class="button-filter border-b"
      on:click={() => changeState(State.Archived)}
      ><i
        class="ri-archive-fill"
        style="color: {archivedColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(State.Archived)}
      ><i class="ri-archive-fill" style="color: {archivedColor}" /></button
    >
  {/if}
</nav>
