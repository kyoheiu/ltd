import { useCallback, useRef, useState } from 'react';
import { useData } from '../../providers/DataProvider';
import { ItemComponent } from '../ItemComponent';
import { Tab } from '../Tab';
import styles from './index.module.css';

export const List = () => {
  const { items, createItem } = useData();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    const value = inputRef.current.value;
    if (!value.trim()) {
      return;
    }
    createItem(value);
    inputRef.current.value = '';
  }, [createItem]);

  const draggedItem = useRef<number | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null);
  const onDragStart = useCallback((idx: number) => {
    draggedItem.current = idx;
  }, []);
  const onDragEnter = useCallback((idx: number) => {
    setDraggedOverItem(idx);
  }, []);

  const onDragEnd = useCallback(() => {
    console.log(draggedItem.current, draggedOverItem);
    draggedItem.current = null;
    setDraggedOverItem(null);
  }, [draggedOverItem]);

  if (items === null) {
    return null;
  }
  return (
    <div className={styles.wrapper} draggable>
      <form action={handleSubmit}>
        <div className={styles.form__wrapper}>
          <input
            type="text"
            name="add"
            className={styles.input}
            ref={inputRef}
          />
          <button type="submit" className={styles.button}>
            +
          </button>
        </div>
      </form>
      <Tab />
      <div className={styles.items__wrapper}>
        {items.map((item, idx) => (
          <div key={item.id}>
            <ItemComponent
              item={item}
              idx={idx}
              isDraggedOver={draggedOverItem === idx}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
