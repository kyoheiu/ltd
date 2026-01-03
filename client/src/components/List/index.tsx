import { useCallback, useRef } from 'react';
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
      <div className={styles['items__wrapper']}>
        {items.map((item) => (
          <div key={item.id}>
            <ItemComponent item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
