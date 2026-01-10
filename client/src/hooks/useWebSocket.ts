import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type Item, ItemsSchema, RequestSchema } from '../../gen/ltd/v1/ws_pb';
import { useNotification } from '../providers/NotificationProvider';

const MAX_RETRIES = 5;
const TIMEOUT_UNIT = 3000;

export const useWebSocket = () => {
  const { notify } = useNotification();
  const [items, setItems] = useState<Item[] | null>(null);
  const retryCountRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) {
      console.error('Max retries reached. Stopping reconnection.');
      return;
    }
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.binaryType = 'arraybuffer';
    socketRef.current = ws;

    ws.onclose = (_event: CloseEvent) => {
      setItems(null);
      retryCountRef.current += 1;
      const timeout = TIMEOUT_UNIT * (retryCountRef.current ^ 2);
      console.warn(
        `Connection lost. Retrying in ${timeout} ms... (${retryCountRef.current}/${MAX_RETRIES})`,
      );
      setTimeout(() => connect(), timeout);
    };
    ws.onopen = () => {
      notify('success', 'Connected to server.');
      retryCountRef.current = 0;
      const buffer = toBinary(
        RequestSchema,
        create(RequestSchema, {
          command: { case: 'read', value: {} },
        }),
      );
      ws.send(buffer);
    };
    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        try {
          const uint8Array = new Uint8Array(event.data);
          const decodedData = fromBinary(ItemsSchema, uint8Array);
          setItems(decodedData.items);
        } catch (e) {
          console.error(`Failed to decode:', ${e}`);
        }
      }
    };
  }, [notify]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const handleLogin = useCallback(
    async (formData: FormData) => {
      const params = new URLSearchParams();
      formData.forEach((value, key) => {
        params.append(key, value.toString());
      });
      startTransition(async () => {
        const res = await fetch('/api/ldaplogin', {
          method: 'POST',
          body: params,
        });
        if (res.ok) {
          retryCountRef.current = 0;
          connect();
        } else {
          notify('error', 'Login failed.');
        }
      });
    },
    [connect, notify],
  );

  const handleLogout = useCallback(async () => {
    startTransition(async () => {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });
      if (res.ok) {
        setItems(null);
      } else {
        notify('error', 'Logout failed.');
      }
    });
  }, [notify]);

  const createItem = useCallback(
    (value: string) => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        notify('error', 'WebSocket is not connected');
        return;
      }
      const request = create(RequestSchema, {
        command: {
          case: 'create',
          value: { value },
        },
      });
      const buffer = toBinary(RequestSchema, request);
      socketRef.current.send(buffer);
    },
    [notify],
  );

  const renameItem = useCallback(
    (item: Item, value: string) => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        notify('error', 'WebSocket is not connected');
        return;
      }
      const request = create(RequestSchema, {
        command: {
          case: 'update',
          value: {
            id: item.id,
            value: value,
            todo: item.todo,
            dot: item.dot,
          },
        },
      });
      const buffer = toBinary(RequestSchema, request);
      socketRef.current.send(buffer);
      notify('success', `Renamed ${item.value} to ${value}.`);
    },
    [notify],
  );

  const toggleArchived = useCallback(
    (item: Item) => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        notify('error', 'WebSocket is not connected');
        return;
      }
      const request = create(RequestSchema, {
        command: {
          case: 'update',
          value: {
            id: item.id,
            value: item.value,
            todo: !item.todo,
            dot: item.dot,
          },
        },
      });
      const buffer = toBinary(RequestSchema, request);
      socketRef.current.send(buffer);
      notify(
        'success',
        `${item.todo ? 'Archived' : 'Unarchived'} ${item.value}.`,
      );
    },
    [notify],
  );

  const toggleDot = useCallback(
    (item: Item) => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        notify('error', 'WebSocket is not connected');
        return;
      }
      const request = create(RequestSchema, {
        command: {
          case: 'update',
          value: {
            id: item.id,
            value: item.value,
            todo: item.todo,
            dot: item.dot === 3 ? 0 : item.dot + 1,
          },
        },
      });
      const buffer = toBinary(RequestSchema, request);
      socketRef.current.send(buffer);
    },
    [notify],
  );

  const sort = useCallback(
    (target: string, insert: string, last: boolean) => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        notify('error', 'WebSocket is not connected');
        return;
      }
      const request = create(RequestSchema, {
        command: {
          case: 'sort',
          value: {
            target,
            insert,
            last,
          },
        },
      });
      const buffer = toBinary(RequestSchema, request);
      socketRef.current.send(buffer);
    },
    [notify],
  );

  const deleteArchived = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      notify('error', 'WebSocket is not connected');
      return;
    }
    const request = create(RequestSchema, {
      command: {
        case: 'delete',
        value: {},
      },
    });
    const buffer = toBinary(RequestSchema, request);
    socketRef.current.send(buffer);
    notify('success', 'Deleted archived items.');
  }, [notify]);

  return {
    items,
    handleLogin,
    handleLogout,
    createItem,
    renameItem,
    toggleArchived,
    toggleDot,
    sort,
    deleteArchived,
  };
};
