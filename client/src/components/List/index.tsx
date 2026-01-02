import { useRef } from 'react';
import { useData } from '../../providers/DataProvider';

export const List = () => {
  const { items, createItem } = useData();
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (items === null) {
    return null;
  }
  return (
    <div>
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
      {items.map((item) => (
        <div key={item.id}>{item.value}</div>
      ))}
    </div>
  );
};
