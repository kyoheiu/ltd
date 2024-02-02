import { Item } from "../types";
import { Suits } from "./Dots";

export const ItemCmp: React.FC<{
  item: Item;
}> = ({ item }: { item: Item }) => {
  return (
    <li>
      <input type="checkbox" />
      {item.value}
      <Suits suit={item.suit} />
    </li>
  );
};
