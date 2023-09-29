import { get } from "svelte/store";
import { state } from "./stores";
import { Page } from "./types";
import { toastError } from "./toast";
import toast from "svelte-french-toast";
import Undo from "./Undo.svelte";

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
    state.update((s) => {
      return {
        ...s,
        items: items,
        archived: archived,
      };
    });
    const res = await fetch(`/api/item?toggle_todo=1&id=${id}`, {
      method: "POST",
    });
    if (!res.ok) {
      archived.splice(i, 0, target);
      items.shift();
      state.update((s) => {
        return {
          ...s,
          items: items,
          archived: archived,
        };
      });
      toastError(res.statusText);
      return;
    }
    const j = await res.json();
    state.update((s) => {
      return {
        ...s,
        modified: j.modified,
      };
    });
  } else {
    i = items.findIndex((item) => item.id == id);
    const target2 = items[i];
    items.splice(i, 1);
    archived.unshift(target2);
    archived[0].todo = false;
    state.update((s) => {
      return {
        ...s,
        items: items,
        archived: archived,
      };
    });
    const res = await fetch(`/api/item?toggle_todo=0&id=${id}`, {
      method: "POST",
    });
    if (!res.ok) {
      items.splice(i, 0, target2);
      archived.shift();
      state.update((s) => {
        return {
          ...s,
          items: items,
          archived: archived,
        };
      });
      toastError(res.statusText);
      return;
    }
    const j = await res.json();
    state.update((s) => {
      return {
        ...s,
        modified: j.modified,
      };
    });
    toast(Undo,  {props: {value: target2.value}, position: "bottom-center"})
  }
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

    state.update((s) => {
      return {
        ...s,
        archived: archived,
      };
    });

    const res = await fetch(
      `/api/item?toggle_dot=${archived[i].dot}&id=${id}`,
      {
        method: "POST",
      }
    );
    if (!res.ok) {
      if (archived[i].dot === 0) {
        archived[i].dot = 3;
      } else {
        archived[i].dot -= 1;
      }
      state.update((s) => {
        return {
          ...s,
          archived: archived,
        };
      });
      toastError(res.statusText);
      return;
    }
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
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

    state.update((s) => {
      return {
        ...s,
        items: items,
      };
    });

    const res = await fetch(`/api/item?toggle_dot=${items[i].dot}&id=${id}`, {
      method: "POST",
    });
    if (!res.ok) {
      if (items[i].dot === 0) {
        items[i].dot = 3;
      } else {
        items[i].dot -= 1;
      }
      state.update((s) => {
        return {
          ...s,
          items: items,
        };
      });
      toastError(res.statusText);
      return;
    }
    const j = await res.json();

    state.update((s) => {
      return {
        ...s,
        modified: j.modified,
      };
    });
  }
};
