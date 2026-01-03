import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Item } from '../../../gen/ltd/v1/ws_pb';

const dialogContext = createContext<{
  handleShowModal: () => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<Item | null>>
}>({} as never);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  useEffect(() => {
    if (selectedItem) {
      handleShowModal();
    }
  }, [selectedItem])

  const ctxValue = {handleShowModal, setSelectedItem};

  return (
    <dialogContext.Provider value={ctxValue}>
      {children}
      <dialog ref={dialogRef}>
        <input type="text" value={selectedItem?.value} />
        <button type="button" onClick={handleCloseModal}>
          Close 
        </button>
      </dialog>
    </dialogContext.Provider>
  );
};

export const useDialog = () => {
  return useContext(dialogContext);
};
