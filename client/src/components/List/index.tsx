import { useCallback, useRef, useState } from 'react';
import { useData } from '../../providers/DataProvider';
import { ItemComponent } from '../ItemComponent';
import { Tab } from '../Tab';
import styles from './index.module.css';

export const List = () => {
  const { items, createItem, sort, deleteArchived, selectedTab } = useData();
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

  const draggedId = useRef<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);
  const [draggedOutside, setDraggedOutside] = useState(false);
  const onDragStart = useCallback((id: string) => {
    draggedId.current = id;
  }, []);
  const onDragEnter = useCallback((id: string) => {
    setDraggedOutside(false);
    setDraggedOverId(id);
  }, []);
  const onDragEnterOutside = useCallback(() => {
    if (!items) {
      return;
    }
    setDraggedOutside(true);
  }, [items]);

  const onDragEnd = useCallback(() => {
    if (draggedId.current !== null && draggedOverId !== null) {
      const target = draggedId.current;
      const insert = draggedOverId;
      if (target === insert) {
        return;
      }
      sort(target, insert, draggedOutside);
    }
    draggedId.current = null;
    setDraggedOverId(null);
    setDraggedOutside(false);
  }, [draggedOverId, draggedOutside, sort]);

  if (items === null) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
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
        {selectedTab === 4 && (
          <button
            type="button"
            className={styles.delete}
            onClick={deleteArchived}
          >
            Delete all archived items
          </button>
        )}
        {items.map((item) => (
          <div key={item.id}>
            <ItemComponent
              item={item}
              isDragged={draggedId.current === item.id}
              isDraggedOver={draggedOverId === item.id && !draggedOutside}
              onDragStart={onDragStart}
              onDragEnter={onDragEnter}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
      </div>
      {draggedOutside && <div className={styles.inserted} />}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag area */}
      <div className={styles.margin__insert} onDragEnter={onDragEnterOutside} />
    </div>
  );
};
