import { io } from 'socket.io-client';

let client;

export function getSocketClient() {
  if (!client) {
    client = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1200,
    });
  }
  return client;
}
