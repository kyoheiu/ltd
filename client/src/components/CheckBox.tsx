import { useCallback } from "react";
import { useItems } from "../contexts/ItemsProvider";
import { Item } from "../types";

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

  return (
    <input type="checkbox" checked={!item.todo} onClick={onClickCheckBox} />
  );
};
