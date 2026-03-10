import React, { useEffect } from 'react';
import {
  FlatList, View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/constants';

export default function ChatListScreen({ navigation }) {
  const { chats, isLoading, fetchChats } = useChatStore();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => { fetchChats(); }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, otherUser: item.otherUser })}
    >
      <Image
        source={{ uri: item.otherUser.profilePhotoUrl || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.otherUser.name}</Text>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMessage
            ? item.lastMessage.messageType === 'shared_post'
              ? item.lastMessage.senderId === currentUser.id ? 'You shared a post' : 'Shared a post'
              : item.lastMessage.senderId === currentUser.id
                ? `You: ${item.lastMessage.text}`
                : item.lastMessage.text
            : 'No messages yet'}
        </Text>
      </View>
      {item.lastMessageAt && (
        <Text style={styles.time}>
          {new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading && chats.length === 0) {
    return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet.{'\n'}Message someone from their profile.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  chatItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderColor: COLORS.lightGray,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.lightGray },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '600', fontSize: 15 },
  lastMsg: { color: COLORS.gray, fontSize: 13, marginTop: 2 },
  time: { fontSize: 12, color: COLORS.gray },
  empty: { textAlign: 'center', color: COLORS.gray, marginTop: 60, fontSize: 15, lineHeight: 24 },
});
