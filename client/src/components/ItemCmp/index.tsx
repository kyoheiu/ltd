import { Item } from "../../types";
import { Suits } from "../Suits";
import { CheckBox } from "../CheckBox";
import styles from "./index.module.css";
import { useCallback } from "react";
import { useItems } from "../../contexts/ItemsProvider";

export const ItemCmp: React.FC<{
  item: Item;
}> = ({ item }: { item: Item }) => {
  const { selectedItem, setSelectedItem } = useItems();

  const onClickName = useCallback(() => {
    if (!!selectedItem) {
      return;
    } else {
      setSelectedItem(item);
    }
  }, [item]);

  return (
    <li className={styles.itemWrapper}>
      <div className={styles.checkBoxAndNameWrapper}>
        <CheckBox item={item} />
        <div onClick={onClickName}>{item.value}</div>
      </div>
      <Suits item={item} />
    </li>
  );
};
