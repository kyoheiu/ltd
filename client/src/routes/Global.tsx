import "../App.css";
import { Item } from "../types";
import { useItems } from "../contexts/ItemsProvider";

export const Global = () => {
  const { state } = useItems();

  if (!state) return null;
  return (
    <>
      {state.items.map((item: Item) => (
        <div>{item.value}</div>
      ))}
    </>
  );
};
