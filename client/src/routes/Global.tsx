import "../App.css";
import { Category, Item } from "../types";
import { useItems } from "../contexts/ItemsProvider";
import { ItemCmp } from "../components/ItemCmp";
import { useMemo, useState } from "react";
import { Nav } from "../components/Nav";

export const Global = () => {
  const { state } = useItems();
  const [category, setCategory] = useState(Category.All);

  const itemsFiltered: Item[] | undefined = useMemo(() => {
    switch (category) {
      case Category.All:
        return state?.items.filter((item) => item.todo);
      case Category.Spade:
        return state?.items.filter((item) => item.todo && item.suit === 0);
      case Category.Heart:
        return state?.items.filter((item) => item.todo && item.suit === 1);
      case Category.Club:
        return state?.items.filter((item) => item.todo && item.suit === 2);
      case Category.Diamond:
        return state?.items.filter((item) => item.todo && item.suit === 3);
      case Category.Archived:
        return state?.items.filter((item) => !item.todo);
      default:
        return [];
    }
  }, [state, category]);

  if (!itemsFiltered) return null;
  return (
    <>
      <Nav setCategory={setCategory} />
      {itemsFiltered &&
        itemsFiltered.map((item: Item) => <ItemCmp item={item} />)}
    </>
  );
};
