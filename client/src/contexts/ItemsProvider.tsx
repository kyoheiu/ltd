import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Suit, ItemsWithModifiedTime, Item, ModifiedTime } from "../types";
import React from "react";
import { ulid } from "ulid";

type CtxValue = {
  state: ItemsWithModifiedTime | null;
  setState: React.Dispatch<React.SetStateAction<ItemsWithModifiedTime | null>>;
  readItem: () => Promise<ItemsWithModifiedTime | null>;
  addItem: (value: string, dot: Suit) => Promise<void>;
  renameItem: (item: Item) => Promise<void>;
  toggleTodo: (item: Item) => Promise<void>;
  toggleSuit: (item: Item) => Promise<void>;
  deleteArchived: () => Promise<void>;
};

const ItemsContext = createContext<CtxValue | null>(null);
export const ItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ItemsWithModifiedTime | null>(null);

  const readItem =
    useCallback(async (): Promise<ItemsWithModifiedTime | null> => {
      const res = await fetch("/api/item");
      if (!res.ok) {
        return null;
      } else {
        return await res.json();
      }
    }, []);

  useEffect(() => {
    const _readItem = async () => {
      const items = await readItem();
      if (items) {
        setState(() => items);
      }
    };
    _readItem();
  }, []);

  // const _readItem = async () => {
  //   const items = [
  //     {
  //       id: "1",
  //       value: "milk",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "2",
  //       value: "orange",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "3",
  //       value: "banana",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "4",
  //       value: "apple",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //     {
  //       id: "5",
  //       value: "watermelon",
  //       todo: true,
  //       dot: 0,
  //       showModal: false,
  //     },
  //   ];
  //   setState({
  //     items,
  //     modified: 0,
  //   });
  // };

  const addItem = useCallback(async (value: string, suit: Suit) => {
    const id = ulid();
    const newItem = {
      id,
      value,
      todo: true,
      suit,
    };
    const res = await fetch(`/api/item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    if (!res.ok) {
      console.error("Failed to add new item.");
    } else {
      const j: ModifiedTime = await res.json();
      setState((prev) => ({
        items: [{ ...newItem, showModal: false }, ...(prev ? prev.items : [])],
        modified: j.modified,
      }));
    }
  }, []);

  const renameItem = useCallback(async (item: Item) => {
    const newItem = {
      ...item,
      value: item.value,
    };
    const res = await fetch(`/api/item/rename`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    if (!res.ok) {
      console.error("Failed.");
    } else {
      const j: ModifiedTime = await res.json();
      setState((prev) => ({
        items: prev
          ? prev.items.map((el) =>
              el.id === item.id ? { ...el, value: item.value } : el
            )
          : [],
        modified: j.modified,
      }));
    }
  }, []);

  const toggleTodo = useCallback(async (item: Item) => {
    const newItem = {
      ...item,
      todo: !item.todo,
    };
    const res = await fetch(`/api/item/todo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    if (!res.ok) {
      console.error("Failed.");
    } else {
      const j: ModifiedTime = await res.json();
      setState((prev) => ({
        items: prev
          ? prev.items.map((el) =>
              el.id === item.id ? { ...el, todo: !el.todo } : el
            )
          : [],
        modified: j.modified,
      }));
    }
  }, []);

  const toggleSuit = useCallback(async (item: Item) => {
    const newItem = {
      ...item,
      suit: item.suit === 3 ? 0 : item.suit + 1,
    };
    const res = await fetch(`/api/item/suit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    if (!res.ok) {
      console.error("Failed.");
    } else {
      const j: ModifiedTime = await res.json();
      setState((prev) => ({
        items: prev
          ? prev.items.map((el) =>
              el.id === item.id ? { ...el, suit: (el.suit + 1) % 4 } : el
            )
          : [],
        modified: j.modified,
      }));
    }
  }, []);

  const deleteArchived = useCallback(async () => {
    const res = await fetch(`/api/item/delete_archived`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.error("Failed.");
    } else {
      const j: ModifiedTime = await res.json();
      setState((prev) => ({
        items: prev ? prev.items.filter((el) => el.todo) : [],
        modified: j.modified,
      }));
    }
  }, []);

  const ctxValue: CtxValue = {
    state,
    setState,
    readItem,
    addItem,
    renameItem,
    toggleTodo,
    toggleSuit,
    deleteArchived,
  };

  return (
    <ItemsContext.Provider value={ctxValue}>{children}</ItemsContext.Provider>
  );
};

export const useItems = () => {
  const ctx = useContext(ItemsContext);
  if (!ctx) {
    throw Error("Cannot access to the items context.");
  }
  return ctx;
};
