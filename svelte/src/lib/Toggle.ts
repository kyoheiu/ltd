import { get } from "svelte/store";
import { state } from "./stores";
import { Page } from "./types";
import {
  archivedColor,
  defaultColor,
  greenColor,
  redColor,
  yellowColor,
} from "./Color";

export const toggleArchived = async (id: string) => {
  let i: number;
  const currentState = get(state);
  let archived = currentState.archived;
  let items = currentState.items;
  if (currentState.page === Page.Archived) {
    i = archived.findIndex((item) => item.id == id);
    const target = archived[i];
    archived.splice(i, 1);
    items.unshift(target);
    items[0].todo = true;
    const res = await fetch(`/api/item?toggle_todo=1&id=${id}`, {
      method: "POST",
    });
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
        items: items,
        archived: archived,
        modified: j.modified,
      };
    });
  } else {
    i = items.findIndex((item) => item.id == id);
    const target2 = items[i];
    items.splice(i, 1);
    archived.unshift(target2);
    archived[0].todo = false;
    const res = await fetch(`/api/item?toggle_todo=0&id=${id}`, {
      method: "POST",
    });
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
        items: items,
        archived: archived,
        modified: j.modified,
      };
    });
  }
};

export const dotColor = (dot: number): string => {
  let color = "";
  switch (dot) {
    case 1:
      color = greenColor;
      break;
    case 2:
      color = yellowColor;
      break;
    case 3:
      color = redColor;
      break;
    case 4:
      color = archivedColor;
      break;
    default:
      color = defaultColor;
      break;
  }
  return color;
};

export const changeColor = async (id: string) => {
  const currentState = get(state);
  let i: number;
  if (currentState.page === Page.Archived) {
    let archived = currentState.archived;
    i = archived.findIndex((item) => item.id === id);
    if (archived[i].dot === 3) {
      archived[i].dot = 0;
    } else {
      archived[i].dot += 1;
    }

    const res = await fetch(
      `/api/item?toggle_dot=${archived[i].dot}&id=${id}`,
      {
        method: "POST",
      }
    );
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
        archived: archived,
        modified: j.modified,
      };
    });
  } else {
    let items = currentState.items;
    i = items.findIndex((item) => item.id === id);
    if (items[i].dot === 3) {
      items[i].dot = 0;
    } else {
      items[i].dot += 1;
    }

    const res = await fetch(`/api/item?toggle_dot=${items[i].dot}&id=${id}`, {
      method: "POST",
    });
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
        items: items,
        modified: j.modified,
      };
    });
  }
};
