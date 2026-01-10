import { createContext, useContext, useMemo, useState } from 'react';
import type { Item } from '../../../gen/ltd/v1/ws_pb';
import { useWebSocket } from '../../hooks/useWebSocket';

const dataContext = createContext<{
  items: Item[] | null;
  createItem: (value: string) => void;
  toggleArchived: (item: Item) => void;
  toggleDot: (item: Item) => void;
  handleLogin: (formData: FormData) => Promise<void>;
  handleLogout: () => Promise<void>;
  selectedTab: number;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
}>({} as never);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    items,
    handleLogin,
    handleLogout,
    createItem,
    toggleArchived,
    toggleDot,
  } = useWebSocket();

  const [selectedTab, setSelectedTab] = useState(-1);

  const displayedItems = useMemo(() => {
    if (!items) {
      return null;
    }
    if (selectedTab === -1) {
      return items.filter((item) => item.todo);
    }
    if (selectedTab === 4) {
      return items.filter((item) => !item.todo);
    }
    return items.filter((item) => item.todo && item.dot === selectedTab);
  }, [items, selectedTab]);

  const ctxValue = useMemo(
    () => ({
      items: displayedItems,
      handleLogin,
      handleLogout,
      createItem,
      toggleArchived,
      toggleDot,
      selectedTab,
      setSelectedTab,
    }),
    [
      displayedItems,
      handleLogin,
      handleLogout,
      createItem,
      toggleArchived,
      toggleDot,
      selectedTab,
    ],
  );

  return (
    <dataContext.Provider value={ctxValue}>{children}</dataContext.Provider>
  );
};

export const useData = () => {
  return useContext(dataContext);
};
