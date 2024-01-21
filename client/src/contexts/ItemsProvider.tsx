import { createContext, useContext, useEffect, useState } from "react";
import { Dot, ItemsWithModifiedTime } from "../types";
import React from "react";
import { ulid } from "ulid";

type CtxValue = {
  state: ItemsWithModifiedTime | null;
};

const ItemsContext = createContext<CtxValue | null>(null);
export const ItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ItemsWithModifiedTime | null>(null);

  // const readItem = async () => {
  //   const res = await fetch("/api/item");
  //   if (!res.ok) {
  //     console.log("Not verified: login form will appear.");
  //   } else {
  //     const j: ItemsWithModifiedTime = await res.json();
  //     setState(() => j);
  //   }
  // };

  const _readItem = async () => {
    const items = [
      {
        id: "1",
        value: "milk",
        todo: true,
        dot: 0,
        showModal: false,
      },
      {
        id: "2",
        value: "orange",
        todo: true,
        dot: 0,
        showModal: false,
      },
      {
        id: "3",
        value: "banana",
        todo: true,
        dot: 0,
        showModal: false,
      },
      {
        id: "4",
        value: "apple",
        todo: true,
        dot: 0,
        showModal: false,
      },
      {
        id: "5",
        value: "watermelon",
        todo: true,
        dot: 0,
        showModal: false,
      },
    ];
    setState({
      items,
      modified: 0,
    });
  };

  const addItem = async (value: string, dot: Dot) => {
    const id = ulid();
    const newItem = {
      id,
      value,
      todo: true,
      dot,
      showModal: false,
    };
    const res = await fetch(`/api/item/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    });
    if (!res.ok) {
      console.error("Failed to add new item.");
    } else {
      setState((prev) => ({
        items: [
          { id: ulid(), value, todo: true, dot, showModal: false },
          ...(prev ? prev.items : []),
        ],
        modified: 0,
      }));
    }
  };

  useEffect(() => {
    _readItem();
  }, []);

  const ctxValue: CtxValue = {
    state,
  };

  return (
    <ItemsContext.Provider value={ctxValue}>{children}</ItemsContext.Provider>
  );
};

export const useItems = () => {
  const ctx = useContext(ItemsContext);
  if (!ctx) {
    throw Error("Cannot access to the items context");
  }
  return ctx;
};
