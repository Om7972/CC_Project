import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId) => {
  const socket = getSocket();
  socket.emit('join-conversation', conversationId);
};

export const sendMessage = (conversationId, message) => {
  const socket = getSocket();
  socket.emit('new-message', { conversationId, message });
};

export const onMessage = (callback) => {
  const socket = getSocket();
  socket.on('message', callback);
};

export const onUserTyping = (callback) => {
  const socket = getSocket();
  socket.on('typing', callback);
};

export const onUserStopTyping = (callback) => {
  const socket = getSocket();
  socket.on('stop-typing', callback);
};

export const emitTyping = (conversationId) => {
  const socket = getSocket();
  socket.emit('user-typing', conversationId);
};

export const emitStopTyping = (conversationId) => {
  const socket = getSocket();
  socket.emit('user-stop-typing', conversationId);
};
