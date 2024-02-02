import { createContext, useCallback, useContext, useState } from "react";
import { Suit, ItemsWithModifiedTime } from "../types";
import React from "react";
import { ulid } from "ulid";

type CtxValue = {
  state: ItemsWithModifiedTime | null;
  setState: React.Dispatch<React.SetStateAction<ItemsWithModifiedTime | null>>;
  readItem: () => Promise<ItemsWithModifiedTime | null>;
  addItem: (value: string, dot: Suit) => Promise<void>;
};

const ItemsContext = createContext<CtxValue | null>(null);
export const ItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ItemsWithModifiedTime | null>(null);

  const readItem = async (): Promise<ItemsWithModifiedTime | null> => {
    const res = await fetch("/api/item");
    if (!res.ok) {
      return null;
    } else {
      return await res.json();
    }
  };

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
        items: [{ ...newItem, showModal: false }, ...(prev ? prev.items : [])],
        modified: 0,
      }));
    }
  }, []);

  const ctxValue: CtxValue = {
    state,
    setState,
    readItem,
    addItem,
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
