'use client';

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_NAMESPACE } from './constants';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
};

export const connectSocket = (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    
    if (s.connected) {
      console.log('Socket already connected');
      resolve(s);
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 10000);

    const onConnect = () => {
      console.log('Socket connected in connectSocket()');
      clearTimeout(timeout);
      s.off('connect_error', onError);
      resolve(s);
    };
    
    const onError = (error: Error) => {
      console.error('Socket connect error:', error);
      clearTimeout(timeout);
      s.off('connect', onConnect);
      reject(error);
    };

    s.once('connect', onConnect);
    s.once('connect_error', onError);

    console.log('Calling socket.connect()...');
    s.connect();
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};
