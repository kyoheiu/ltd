import { useEffect, useState } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { Item, ItemsWithModifiedTime } from "./types";

const Global = () => {
  const [state, setState] = useState<ItemsWithModifiedTime | null>(null);

  const readItem = async () => {
    const res = await fetch("/api/item");
    if (!res.ok) {
      console.log("Not verified: login form will appear.");
      // state.update(() => {
      //   return {
      //     ...new State(),
      //     page: Page.NotLoggedIn,
      //   };
      // });
    } else {
      const j: ItemsWithModifiedTime = await res.json();
      setState(() => j);
    }
  };

  useEffect(() => {
    readItem();
  }, []);

  if (!state) return null;

  return (
    <>
      <Header />
      {state.items.map((item: Item) => (
        <div>{item.value}</div>
      ))}
    </>
  );
};

export default Global;
