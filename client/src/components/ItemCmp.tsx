import { Item } from "../types";
import { Suits } from "./Suits";
import { CheckBox } from "./CheckBox";

export const ItemCmp: React.FC<{
  item: Item;
}> = ({ item }: { item: Item }) => {
  return (
    <li>
      <CheckBox item={item} />
      {item.value}
      <Suits item={item} />
    </li>
  );
};
