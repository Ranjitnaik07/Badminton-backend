import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socketService';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true });
        await connectSocket();
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken });
    const { accessToken, refreshToken, user } = data.data;
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
    await connectSocket();
    return data.data;
  },

  updateUser: (updates) => {
    const current = get().user;
    const updated = { ...current, ...updates };
    set({ user: updated });
    SecureStore.setItemAsync('user', JSON.stringify(updated));
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
