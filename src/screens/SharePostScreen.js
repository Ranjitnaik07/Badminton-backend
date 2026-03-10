import React, { useState } from 'react';
import {
  View, FlatList, TextInput, StyleSheet, Text, Alert,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import UserListItem from '../components/UserListItem';
import api from '../services/api';
import { COLORS } from '../utils/constants';

let debounceTimer;

export default function SharePostScreen({ route, navigation }) {
  const { postId } = route.params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(null);

  const search = (q) => {
    clearTimeout(debounceTimer);
    if (q.length < 2) { setResults([]); return; }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/search', { params: { q } });
        setResults(data.data);
      } finally { setLoading(false); }
    }, 300);
  };

  const handleShare = async (user) => {
    setSharing(user.id);
    try {
      const chatRes = await api.post('/chats', { userId: user.id });
      const chatId = chatRes.data.data.id;
      await api.post(`/chats/${chatId}/messages`, { postId, messageType: 'shared_post' });
      Alert.alert('Shared!', `Post shared to ${user.name}.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not share post.');
    } finally {
      setSharing(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(t) => { setQuery(t); search(t); }}
          placeholder="Search users to share..."
          autoCapitalize="none"
        />
        {loading && <ActivityIndicator size="small" color={COLORS.gray} />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            onPress={handleShare}
            rightElement={
              sharing === item.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.sendBtn}>Send</Text>
              )
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.background, borderRadius: 12,
  },
  icon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15 },
  sendBtn: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
