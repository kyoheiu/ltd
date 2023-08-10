import { get, writable, type Writable } from "svelte/store";
import type { Item, ItemsWithModifiedTime } from "./types";
import { Page } from "./types";

export class State {
  page: Page;
  modified: number;
  items: Item[];
  archived: Item[];
  newItem: string;
  showDialog: boolean;

  constructor() {
    this.page = Page.All;
    this.modified = 0;
    this.items = [];
    this.archived = [];
    this.newItem = "";
    this.showDialog = false;
  }
}

export const state: Writable<State> = writable(new State());

export const readItem = async () => {
  const res = await fetch("/api/item");
  if (!res.ok) {
    console.log("Not verified: login form will appear.");
    state.update(() => {
      return {
        ...new State(),
        page: Page.NotLoggedIn,
      };
    });
  } else {
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
        state: Page.All,
        items: items,
        archived: archived,
        modified: j.modified,
      };
    });
  }
};
