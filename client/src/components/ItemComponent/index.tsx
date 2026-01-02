import type { Item } from '../../../gen/ltd/v1/ws_pb';

export const ItemComponent: React.FC<{
  item: Item;
}> = ({ item }) => {
  return (
    <div>
      {item.value}
      {item.dot}
    </div>
  );
};
