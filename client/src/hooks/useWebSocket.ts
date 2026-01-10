import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type Item, ItemsSchema, RequestSchema } from '../../gen/ltd/v1/ws_pb';

const MAX_RETRIES = 5;
const TIMEOUT = 3000;

export const useWebSocket = () => {
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

    ws.onclose = (event: CloseEvent) => {
      console.log(`WebSocket connection closed.`);
      if (!event.wasClean) {
        console.warn('Connection lost or failed to connect.');
      }
      console.warn(
        `Connection lost. Retrying in ${TIMEOUT}ms... (${retryCountRef.current + 1}/${MAX_RETRIES})`,
      );

      setItems(null);
      retryCountRef.current += 1;
      setTimeout(() => connect(), TIMEOUT);
    };
    ws.onopen = () => {
      console.log('Connected to WebSocket server.');
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
  }, []);

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
          console.error('Login failed');
        }
      });
    },
    [connect],
  );

  const handleLogout = useCallback(async () => {
    startTransition(async () => {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });
      if (res.ok) {
        setItems(null);
      } else {
        console.error('Logout failed');
      }
    });
  }, []);

  const createItem = useCallback((value: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
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
  }, []);

  const toggleArchived = useCallback((item: Item) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
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
  }, []);

  const toggleDot = useCallback((item: Item) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
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
  }, []);

  const sort = useCallback((target: string, insert: string, last: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
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
  }, []);

  const deleteArchived = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
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
  }, []);

  return {
    items,
    handleLogin,
    handleLogout,
    createItem,
    toggleArchived,
    toggleDot,
    sort,
    deleteArchived,
  };
};
