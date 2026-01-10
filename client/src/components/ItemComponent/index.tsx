import { useCallback, useRef } from 'react';
import type { Item } from '../../../gen/ltd/v1/ws_pb';
import { useData } from '../../providers/DataProvider';
import { useDialog } from '../../providers/DialogProvider';
import {
  IconCheckbox,
  IconCheckboxChecked,
  IconGrip,
  shapesMap,
} from '../Icons';

import styles from './index.module.css';

export const ItemComponent: React.FC<{
  item: Item;
  idx: number;
  isDraggedOver: boolean;
  onDragStart: (idx: number) => void;
  onDragEnter: (idx: number) => void;
  onDragEnd: () => void;
}> = ({ item, idx, isDraggedOver, onDragStart, onDragEnter, onDragEnd }) => {
  const { selectedTab, toggleArchived, toggleDot } = useData();
  const { setSelectedItem } = useDialog();

  return (
    <>
      {isDraggedOver && <div className={styles.inserted}/>}
      <div
        className={styles.wrapper}
        draggable
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragStart={() => onDragStart(idx)}
        onDragEnter={() => onDragEnter(idx)}
        onDragEnd={onDragEnd}
      >
        <div className={styles.checkbox__and__value}>
          <button
            type="button"
            className={styles.checkbutton}
            onClick={() => toggleArchived(item)}
          >
            {item.todo ? <IconCheckbox /> : <IconCheckboxChecked />}
          </button>
          <button type="button" onClick={() => setSelectedItem(item)}>
            <div className={styles.value}>{item.value}</div>
          </button>
        </div>
        <div className={styles.right__buttons}>
          {selectedTab === -1 && (
            <div className={styles.grip}>
              <IconGrip />
            </div>
          )}
          <button type="button" onClick={() => toggleDot(item)}>
            {shapesMap.get(item.dot.toString())}
          </button>
        </div>
      </div>
    </>
  );
};
