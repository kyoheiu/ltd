import { createContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const notificationContext = createContext<{
  notify: (type: (typeof notificationTypes)[number], msg: string) => void;
}>({} as never);

const notificationTypes = ['success', 'error'] as const;

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const notify = useCallback(
    (type: (typeof notificationTypes)[number], msg: string) => {
      switch (type) {
        case 'success':
          toast.success(msg);
          break;
        case 'error':
          toast.error(msg);
          break;
        default:
          throw Error('type not found.');
      }
    },
    [],
  );

  return (
    <notificationContext.Provider value={{ notify }}>
      {children}
      <Toaster />
    </notificationContext.Provider>
  );
};
