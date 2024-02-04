import "../App.css";
import { Category, Item } from "../types";
import { useItems } from "../contexts/ItemsProvider";
import { ItemCmp } from "../components/ItemCmp";
import { useEffect, useState } from "react";
import { Nav } from "../components/Nav";
import { ReactSortable, SortableEvent } from "react-sortablejs";

export const Global = () => {
  const { state, sortItem } = useItems();
  const [category, setCategory] = useState(Category.All);
  const [itemsFiltered, setItemsFiltered] = useState<Item[] | undefined>(
    state?.items.filter((item) => item.todo)
  );

  useEffect(() => {
    switch (category) {
      case Category.All:
        setItemsFiltered(state?.items.filter((item) => item.todo));
        break;
      case Category.Spade:
        setItemsFiltered(
          state?.items.filter((item) => item.todo && item.suit === 0)
        );
        break;
      case Category.Heart:
        setItemsFiltered(
          state?.items.filter((item) => item.todo && item.suit === 1)
        );
        break;
      case Category.Club:
        setItemsFiltered(
          state?.items.filter((item) => item.todo && item.suit === 2)
        );
        break;
      case Category.Diamond:
        setItemsFiltered(
          state?.items.filter((item) => item.todo && item.suit === 3)
        );
        break;
      case Category.Archived:
        setItemsFiltered(state?.items.filter((item) => !item.todo));
        break;
    }
  }, [state, category]);

  const onSort = async (e: SortableEvent) => {
    if (e.oldIndex === undefined || e.newIndex === undefined) return;
    await sortItem(e.oldIndex, e.newIndex);
  };

  if (!itemsFiltered) return null;
  return (
    <>
      <Nav setCategory={setCategory} />
      {category === Category.All && itemsFiltered ? (
        <ReactSortable
          list={itemsFiltered}
          setList={setItemsFiltered}
          onEnd={onSort}
        >
          {itemsFiltered.map((item: Item) => (
            <ItemCmp key={item.id} item={item} />
          ))}
        </ReactSortable>
      ) : (
        itemsFiltered.map((item: Item) => <ItemCmp item={item} />)
      )}
    </>
  );
};
