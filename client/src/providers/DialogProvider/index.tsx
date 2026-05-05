import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Item } from '../../../gen/ltd/v1/ws_pb';
import { useData } from '../DataProvider';

import styles from './index.module.css';

const dialogContext = createContext<{
  handleShowModal: () => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<Item | null>>;
}>({} as never);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { renameItem } = useData();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handleShowModal = useCallback(() => dialogRef.current?.showModal(), []);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  useEffect(() => {
    if (selectedItem) {
      handleShowModal();
    }
  }, [selectedItem, handleShowModal]);
  const handleCloseModal = useCallback(() => {
    dialogRef.current?.close();
    setSelectedItem(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (!selectedItem) {
        return;
      }
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const value = form.get('value') as string;
      if (!value || !value.trim()) {
        return;
      }
      renameItem(selectedItem, value);
      handleCloseModal();
    },
    [selectedItem, renameItem, handleCloseModal],
  );

  const ctxValue = { handleShowModal, setSelectedItem };

  return (
    <dialogContext.Provider value={ctxValue}>
      {children}
      <dialog className={styles.dialog} key={selectedItem?.id} ref={dialogRef}>
        <form onSubmit={handleSubmit} className={styles.wrapper}>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              name="value"
              type="text"
              defaultValue={selectedItem?.value}
            />
            <button className={styles.primaryButton} type="submit">
              rename
            </button>
          </div>
          <button
            className={styles.button}
            type="button"
            onClick={handleCloseModal}
          >
            close
          </button>
        </form>
      </dialog>
    </dialogContext.Provider>
  );
};

export const useDialog = () => {
  return useContext(dialogContext);
};
