import { useRef } from 'react';
import { useData } from '../../providers/DataProvider';
import { ItemComponent } from '../ItemComponent';

import styles from './index.module.css';

export const List = () => {
  const { items, createItem, handleLogout } = useData();
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (items === null) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      <form>
        <input type="text" ref={inputRef} />
        <button
          type="button"
          onClick={() => {
            if (!inputRef.current) {
              return;
            }
            const value = inputRef.current.value;
            if (!value.trim()) {
              return;
            }
            createItem(value);
            inputRef.current.value = '';
          }}
        >
          add
        </button>
      </form>
      <button type="button" onClick={handleLogout}>
        log out
      </button>
      {items.map((item) => (
        <div key={item.id}>
          <ItemComponent item={item} />
        </div>
      ))}
    </div>
  );
};
