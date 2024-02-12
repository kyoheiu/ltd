import { Item } from "../../types";
import { Suits } from "../Suits";
import { CheckBox } from "../CheckBox";
import styles from "./index.module.css";

export const ItemCmp: React.FC<{
  item: Item;
}> = ({ item }: { item: Item }) => {
  return (
    <li className={styles.itemWrapper}>
      <div className={styles.checkBoxAndNameWrapper}>
        <CheckBox item={item} />
        {item.value}
      </div>
      <Suits item={item} />
    </li>
  );
};
