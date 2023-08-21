<script lang="ts">
  import { SYMBOL_SIZE, Page } from "./types.ts";
  import { state } from "./stores.ts";
  import IconCircle from "@tabler/icons-svelte/dist/svelte/icons/IconCircle.svelte";
  import IconSpadeFilled from "@tabler/icons-svelte/dist/svelte/icons/IconSpadeFilled.svelte";
  import IconHeartFilled from "@tabler/icons-svelte/dist/svelte/icons/IconHeartFilled.svelte";
  import IconClubsFilled from "@tabler/icons-svelte/dist/svelte/icons/IconClubsFilled.svelte";
  import IconDiamondsFilled from "@tabler/icons-svelte/dist/svelte/icons/IconDiamondsFilled.svelte";
  import IconArchiveFilled from "@tabler/icons-svelte/dist/svelte/icons/IconArchiveFilled.svelte";

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
      class="button-filter border-b border-foreground text-xs text-foreground"
      on:click={() => changeState(Page.All)}
      ><IconCircle size={SYMBOL_SIZE} /></button
    >
  {:else}
    <button
      class="button-filter text-foreground"
      on:click={() => changeState(Page.All)}
      ><IconCircle size={SYMBOL_SIZE} /></button
    >
  {/if}
  {#if $state.page == Page.Default}
    <button
      class="button-filter border-b border-foreground"
      on:click={() => changeState(Page.Default)}
    >
      <IconSpadeFilled class="text-default" size={SYMBOL_SIZE} />
    </button>
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Default)}>
      <IconSpadeFilled class="text-default" size={SYMBOL_SIZE} />
    </button>
  {/if}
  {#if $state.page == Page.Green}
    <button
      class="button-filter border-b border-foreground"
      on:click={() => changeState(Page.Green)}
    >
      <IconHeartFilled class="text-green" size={SYMBOL_SIZE} />
    </button>
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Green)}>
      <IconHeartFilled class="text-green" size={SYMBOL_SIZE} />
    </button>
  {/if}
  {#if $state.page == Page.Yellow}
    <button
      class="button-filter border-b border-foreground"
      on:click={() => changeState(Page.Yellow)}
    >
      <IconClubsFilled class="text-yellow" size={SYMBOL_SIZE} />
    </button>
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Yellow)}>
      <IconClubsFilled class="text-yellow" size={SYMBOL_SIZE} />
    </button>
  {/if}
  {#if $state.page == Page.Red}
    <button
      class="button-filter border-b border-foreground"
      on:click={() => changeState(Page.Red)}
    >
      <IconDiamondsFilled class="text-red" size={SYMBOL_SIZE} />
    </button>
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Red)}>
      <IconDiamondsFilled class="text-red" size={SYMBOL_SIZE} />
    </button>
  {/if}
  {#if $state.page == Page.Archived}
    <button
      class="button-filter border-b border-foreground"
      on:click={() => changeState(Page.Archived)}
    >
      <IconArchiveFilled size={SYMBOL_SIZE} />
    </button>
  {:else}
    <button class="button-filter" on:click={() => changeState(Page.Archived)}>
      <IconArchiveFilled size={SYMBOL_SIZE} />
    </button>
  {/if}
</nav>
