import { createContext, useContext, useMemo } from 'react';
import type { Item } from '../../../gen/ltd/v1/ws_pb';
import { useWebSocket } from '../../hooks/useWebSocket';

const dataContext = createContext<{
  items: Item[] | null;
  createItem: (value: string) => void;
  handleLogin: (formData: FormData) => Promise<void>;
  handleLogout: () => Promise<void>;
}>({} as never);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { items, handleLogin, handleLogout, createItem } = useWebSocket();

  const ctxValue = useMemo(
    () => ({
      items,
      handleLogin,
      handleLogout,
      createItem,
    }),
    [items, handleLogin, handleLogout, createItem],
  );

  return (
    <dataContext.Provider value={ctxValue}>{children}</dataContext.Provider>
  );
};

export const useData = () => {
  return useContext(dataContext);
};
