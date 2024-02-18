import "../../App.css";
import { Category, Item } from "../../types";
import { useItems } from "../../contexts/ItemsProvider";
import { ItemCmp } from "../../components/ItemCmp";
import { useCallback, useEffect, useState } from "react";
import { Nav } from "../../components/Nav";
import { ReactSortable, SortableEvent } from "react-sortablejs";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";

export const Global = () => {
  const {
    state,
    isLoadedItem,
    sortItem,
    renameItem,
    selectedItem,
    setSelectedItem,
  } = useItems();
  const [category, setCategory] = useState(Category.All);
  const [itemsFiltered, setItemsFiltered] = useState<Item[] | undefined>(
    state?.items.filter((item) => item.todo)
  );
  const navigate = useNavigate();

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

  const onSubmitNewValue = useCallback(
    async (event: React.FormEvent, newValue?: string) => {
      event.preventDefault();
      if (!!selectedItem || !newValue) return;
      await renameItem({ ...selectedItem!, value: newValue });
      setSelectedItem(null);
    },
    []
  );

  const onClickCancel = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setSelectedItem(null);
  }, []);

  // if (isLoadedItem && !state) {
  //   navigate("/login");
  // }
  if (!itemsFiltered) return null;
  return (
    <div className={styles.globalWrapper}>
      <Nav category={category} setCategory={setCategory} />
      <div className={styles.divider} />
      {category === Category.All ? (
        <ReactSortable
          list={itemsFiltered}
          setList={setItemsFiltered}
          onEnd={onSort}
          delayOnTouchOnly={true}
          delay={500}
          className={styles.listWrapper}
        >
          {itemsFiltered.map((item: Item, index) => (
            <ItemCmp key={index} item={item} />
          ))}
        </ReactSortable>
      ) : (
        <div className={styles.listWrapper}>
          {itemsFiltered.map((item: Item, index) => (
            <ItemCmp key={index} item={item} />
          ))}
        </div>
      )}
      <dialog open={!!selectedItem}>
        <form onSubmit={onSubmitNewValue}>
          <input defaultValue={selectedItem?.value} />
          <button onClick={onClickCancel}>cancel</button>
        </form>
      </dialog>
    </div>
  );
};
