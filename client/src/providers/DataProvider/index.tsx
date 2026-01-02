import { createContext, useActionState, useContext, useMemo } from 'react';
import type { Item } from '../../../gen/ltd/v1/ws_pb';
import { useWebSocket } from '../../hooks/useWebSocket';

const dataContext = createContext<{
  items: Item[] | null;
  createItem: (value: string) => void;
  isLoggedIn: boolean;
  formAction: () => void;
}>({} as never);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, formAction] = useActionState<boolean>(() => true, false);

  const { items, createItem } = useWebSocket();

  const ctxValue = useMemo(
    () => ({
      items,
      createItem,
      isLoggedIn,
      formAction,
    }),
    [items, isLoggedIn, createItem, formAction],
  );

  return (
    <dataContext.Provider value={ctxValue}>{children}</dataContext.Provider>
  );
};

export const useData = () => {
  return useContext(dataContext);
};
