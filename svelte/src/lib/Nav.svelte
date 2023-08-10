<script lang="ts">
  import {
    defaultColor,
    greenColor,
    yellowColor,
    redColor,
    archivedColor,
  } from "./Color.ts";
  import { Page } from "./types.ts";
  import { readItem, state } from "./stores.ts";
  import { get } from "svelte/store";

  const changeState = async (newPage: Page) => {
    state.update((s) => {
      return {
        ...s,
        page: newPage,
      };
    });
  };
</script>

<nav class="flex justify-center space-x-4">
  {#if $state.page == Page.All}
    <button
      class="button-filter border-b border-slate-200 text-slate-200"
      on:click={() => changeState(Page.All)}
      ><i class="ri-checkbox-blank-circle-line" /></button
    >
  {:else}
    <button
      class="button-filter text-slate-200"
      on:click={() => changeState(Page.All)}
      ><i class="ri-checkbox-blank-circle-line" /></button
    >
  {/if}
  {#if $state.page == Page.Default}
    <button
      class="button-filter border-b border-slate-200"
      on:click={() => changeState(Page.Default)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {defaultColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Default)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {defaultColor}"
      /></button
    >
  {/if}
  {#if $state.page == Page.Green}
    <button
      class="button-filter border-b border-slate-200"
      on:click={() => changeState(Page.Green)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {greenColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Green)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {greenColor}"
      /></button
    >
  {/if}
  {#if $state.page == Page.Yellow}
    <button
      class="button-filter border-b border-slate-200"
      on:click={() => changeState(Page.Yellow)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {yellowColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Yellow)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {yellowColor}"
      /></button
    >
  {/if}
  {#if $state.page == Page.Red}
    <button
      class="button-filter border-b border-slate-200"
      on:click={() => changeState(Page.Red)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {redColor}"
      /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Red)}
      ><i
        class="ri-checkbox-blank-circle-fill"
        style="color: {redColor}"
      /></button
    >
  {/if}
  {#if $state.page == Page.Archived}
    <button
      class="button-filter border-b border-slate-200"
      on:click={() => changeState(Page.Archived)}
      ><i class="ri-archive-fill" style="color: {archivedColor}" /></button
    >
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Archived)}
      ><i class="ri-archive-fill" style="color: {archivedColor}" /></button
    >
  {/if}
</nav>
