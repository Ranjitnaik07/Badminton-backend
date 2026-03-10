import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '../utils/constants';

let socket = null;

export const connectSocket = async () => {
  if (socket?.connected) return socket;
  const token = await SecureStore.getItemAsync('accessToken');
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinChat = (chatId) => socket?.emit('join_chat', chatId);
export const leaveChat = (chatId) => socket?.emit('leave_chat', chatId);
export const emitTyping = (chatId) => socket?.emit('typing', { chatId });
export const emitStopTyping = (chatId) => socket?.emit('stop_typing', { chatId });
