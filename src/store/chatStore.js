import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  chats: [],
  isLoading: false,

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/chats');
      set({ chats: data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  updateLastMessage: (chatId, message) => {
    set({
      chats: get().chats.map((c) =>
        c.id === chatId ? { ...c, lastMessage: message, lastMessageAt: message.createdAt } : c
      ),
    });
  },

  reset: () => set({ chats: [], isLoading: false }),
}));

export default useChatStore;
