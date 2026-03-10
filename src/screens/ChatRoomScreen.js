import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList, View, TextInput, TouchableOpacity, Text, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator,
} from 'react-native';
import MessageBubble from '../components/MessageBubble';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import api from '../services/api';
import { getSocket, joinChat, leaveChat } from '../services/socketService';
import { COLORS } from '../utils/constants';

export default function ChatRoomScreen({ route, navigation }) {
  const { chatId, otherUser } = route.params;
  const currentUser = useAuthStore((s) => s.user);
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);

  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: otherUser.name });
    fetchMessages(true);
    joinChat(chatId);

    const socket = getSocket();
    if (socket) {
      socket.on('new_message', handleNewMessage);
    }

    return () => {
      leaveChat(chatId);
      socket?.off('new_message', handleNewMessage);
    };
  }, [chatId]);

  const handleNewMessage = (msg) => {
    if (msg.chatId !== chatId) return;
    setMessages((prev) => [...prev, msg]);
    updateLastMessage(chatId, msg);
  };

  const fetchMessages = async (refresh = false) => {
    try {
      const params = { limit: 20 };
      if (!refresh && nextCursor) params.cursor = nextCursor;
      const { data } = await api.get(`/chats/${chatId}/messages`, { params });
      setMessages((prev) => refresh ? data.data.messages : [...data.data.messages, ...prev]);
      setNextCursor(data.data.nextCursor);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const msgText = text.trim();
    setText('');
    try {
      const { data } = await api.post(`/chats/${chatId}/messages`, { text: msgText });
      setMessages((prev) => [...prev, data.data]);
      updateLastMessage(chatId, data.data);
    } catch { setText(msgText); }
    finally { setSending(false); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === currentUser.id}
              onPostPress={(postId) => navigation.navigate('PostDetail', { postId })}
            />
          )}
          onEndReached={() => nextCursor && fetchMessages()}
          onEndReachedThreshold={0.1}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ paddingVertical: 8 }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.disabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 8, borderTopWidth: 0.5, borderColor: COLORS.lightGray,
  },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.lightGray,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 15, maxHeight: 100, marginRight: 8,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendIcon: { color: COLORS.white, fontSize: 16 },
  disabled: { opacity: 0.4 },
});
