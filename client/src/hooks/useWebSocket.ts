import { create, fromBinary, toBinary, toJson } from '@bufbuild/protobuf';
import { useEffect, useRef, useState } from 'react';
import { type Item, ItemsSchema, RequestSchema } from '../../gen/ltd/v1/ws_pb';

const MAX_RETRIES = 5;
const TIMEOUT = 3000;

export const useWebSocket = () => {
    const [items, setItems] = useState<Item[] | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Stop if retry count exceeds the limit
        if (retryCount >= MAX_RETRIES) {
            console.error('Max retries reached. Stopping reconnection.');
            return;
        }
        const ws = new WebSocket('ws://localhost:8080/ws');
        ws.binaryType = 'arraybuffer';
        socketRef.current = ws;

        const onClose = (event: CloseEvent) => {
            console.log(`WebSocket connection closed.`);
            if (!event.wasClean) {
                console.warn('Connection lost or failed to connect.');
            }
            console.warn(
                `Connection lost. Retrying in ${TIMEOUT}ms... (${retryCount + 1}/${MAX_RETRIES})`,
            );

            setItems(null);
            // setTimeout(() => {
            //     setRetryCount((prev) => prev + 1);
            // }, TIMEOUT);
        };
        ws.addEventListener('close', onClose);
        ws.addEventListener('open', (event) => {
            console.log('Connected to echo server');

            const buffer = toBinary(
                RequestSchema,
                create(RequestSchema, {
                    command: { case: 'read', value: {} },
                }),
            );
            ws.send(buffer);
        });
        const onMessage = (event: MessageEvent) => {
            if (event.data instanceof ArrayBuffer) {
                try {
                    const uint8Array = new Uint8Array(event.data);
                    const decodedData = fromBinary(ItemsSchema, uint8Array);
                    console.log(decodedData);
                    setItems(decodedData.items);
                } catch (e) {
                    console.error(`Failed to decode:', ${e}`);
                }
            }
        };
        ws.addEventListener('message', onMessage);

        return () => {
            ws.close();
            ws.removeEventListener('message', onMessage);
            ws.removeEventListener('close', onClose);
        };
    }, [retryCount]);

    const createItem = (value: string) => {
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
    };

    return { items, createItem };
};
