import type { Item } from '../../../gen/ltd/v1/ws_pb';
import { useData } from '../../providers/DataProvider';
import { useDialog } from '../../providers/DialogProvider';
import { IconCheckbox, IconCheckboxChecked, shapesMap } from '../Icons';

import styles from './index.module.css';

export const ItemComponent: React.FC<{
  item: Item;
}> = ({ item }) => {
  const { toggleArchived, toggleDot } = useData();
  const {setSelectedItem} = useDialog();

  return (
    <div className={styles.wrapper}>
      <div className={styles.checkbox__and__value}>
        <button
          type="button"
          className={styles.checkbutton}
          onClick={() => toggleArchived(item)}
        >
          {item.todo ? <IconCheckbox /> : <IconCheckboxChecked />}
        </button>
        <div onMouseDown={() => setSelectedItem(item)}>{item.value}</div>
      </div>
      <button type="button" onClick={() => toggleDot(item)}>
        {shapesMap.get(item.dot.toString())}
      </button>
    </div>
  );
};
