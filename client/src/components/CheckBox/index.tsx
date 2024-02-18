import { useCallback } from "react";
import { useItems } from "../../contexts/ItemsProvider";
import { Item } from "../../types";
import { IconSquare, IconSquareCheck } from "@tabler/icons-react";
import styles from "./index.module.css";

export const CheckBox: React.FC<{ item: Item }> = ({
  item,
}: {
  item: Item;
}) => {
  const { toggleTodo } = useItems();

  const onClickCheckBox = useCallback(
    async (_e: React.MouseEvent) => await toggleTodo(item),
    [item]
  );

  return item.todo ? (
    <button onClick={onClickCheckBox}>
      <IconSquare className={styles.checkBox} />
    </button>
  ) : (
    <button onClick={onClickCheckBox}>
      <IconSquareCheck className={styles.checkBox} />
    </button>
  );
};
