import React, { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import PostCard from '../components/PostCard';
import UserListItem from '../components/UserListItem';
import usePostStore from '../store/postStore';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toggleLike = usePostStore((s) => s.toggleLike);

  useEffect(() => { fetchPost(); fetchComments(true); }, []);

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}`);
      setPost(data.data);
    } catch { Alert.alert('Error', 'Could not load post.'); }
    finally { setLoading(false); }
  };

  const fetchComments = async (refresh = false) => {
    try {
      const params = { limit: 20 };
      if (!refresh && nextCursor) params.cursor = nextCursor;
      const { data } = await api.get(`/posts/${postId}/comments`, { params });
      setComments((prev) => refresh ? data.data.comments : [...prev, ...data.data.comments]);
      setNextCursor(data.data.nextCursor);
    } catch {}
  };

  const handleLike = async () => {
    setPost((p) => ({
      ...p,
      isLiked: !p.isLiked,
      _count: { ...p._count, likes: p._count.likes + (!p.isLiked ? 1 : -1) },
    }));
    try {
      await api.post(`/posts/${postId}/like`);
      toggleLike(postId);
    } catch {
      setPost((p) => ({
        ...p,
        isLiked: !p.isLiked,
        _count: { ...p._count, likes: p._count.likes + (!p.isLiked ? 1 : -1) },
      }));
    }
  };

  const handleComment = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text: text.trim() });
      setComments((prev) => [data.data, ...prev]);
      setPost((p) => ({ ...p, _count: { ...p._count, comments: p._count.comments + 1 } }));
      setText('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((p) => ({ ...p, _count: { ...p._count, comments: p._count.comments - 1 } }));
    } catch {}
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={post ? (
          <PostCard
            post={post}
            onLike={handleLike}
            onShare={(p) => navigation.navigate('SharePost', { postId: p.id })}
            onUserPress={(username) => navigation.navigate('UserProfile', { username })}
          />
        ) : null}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <UserListItem
              user={item.user}
              onPress={(u) => navigation.navigate('UserProfile', { username: u.username })}
              rightElement={
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              }
            />
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        )}
        onEndReached={() => nextCursor && fetchComments()}
        onEndReachedThreshold={0.5}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.commentInput}
          value={text}
          onChangeText={setText}
          placeholder="Add a comment..."
          multiline
        />
        <TouchableOpacity onPress={handleComment} disabled={!text.trim() || submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.postBtn, !text.trim() && styles.disabled]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  commentRow: { paddingBottom: 8 },
  commentText: { paddingHorizontal: 72, paddingTop: 2, fontSize: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 8, borderTopWidth: 0.5, borderColor: COLORS.lightGray,
  },
  commentInput: { flex: 1, fontSize: 14, maxHeight: 80, marginRight: 8 },
  postBtn: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  deleteBtn: { color: COLORS.gray, fontSize: 12, padding: 4 },
  disabled: { opacity: 0.4 },
});
