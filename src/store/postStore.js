import { create } from 'zustand';
import api from '../services/api';

const usePostStore = create((set, get) => ({
  posts: [],
  nextCursor: null,
  hasMore: true,
  isLoading: false,

  fetchFeed: async (refresh = false) => {
    const { isLoading, nextCursor, hasMore } = get();
    if (isLoading || (!refresh && !hasMore)) return;

    set({ isLoading: true });
    try {
      const cursor = refresh ? null : nextCursor;
      const params = { limit: 20 };
      if (cursor) params.cursor = cursor;

      const { data } = await api.get('/posts', { params });
      const { posts, nextCursor: newCursor } = data.data;

      set({
        posts: refresh ? posts : [...get().posts, ...posts],
        nextCursor: newCursor,
        hasMore: !!newCursor,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleLike: async (postId) => {
    const posts = get().posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = !p.isLiked;
      return {
        ...p,
        isLiked: liked,
        _count: { ...p._count, likes: p._count.likes + (liked ? 1 : -1) },
      };
    });
    set({ posts });

    try {
      await api.post(`/posts/${postId}/like`);
    } catch {
      // revert on error
      const reverted = get().posts.map((p) => {
        if (p.id !== postId) return p;
        const liked = !p.isLiked;
        return {
          ...p,
          isLiked: liked,
          _count: { ...p._count, likes: p._count.likes + (liked ? 1 : -1) },
        };
      });
      set({ posts: reverted });
    }
  },

  addPost: (post) => set({ posts: [{ ...post, isLiked: false }, ...get().posts] }),

  removePost: (postId) => set({ posts: get().posts.filter((p) => p.id !== postId) }),

  reset: () => set({ posts: [], nextCursor: null, hasMore: true, isLoading: false }),
}));

export default usePostStore;
