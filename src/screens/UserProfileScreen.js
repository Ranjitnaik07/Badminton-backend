import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, SafeAreaView, Alert,
} from 'react-native';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 3;

export default function UserProfileScreen({ route, navigation }) {
  const currentUser = useAuthStore((s) => s.user);
  const username = route.params?.username || currentUser?.username;
  const isOwn = username === currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`),
      ]);
      setProfile(profileRes.data.data);
      setPosts(postsRes.data.data);
    } catch { Alert.alert('Error', 'Could not load profile.'); }
    finally { setLoading(false); }
  };

  const handleMessage = async () => {
    try {
      const { data } = await api.post('/chats', { userId: profile.id });
      navigation.navigate('Chat', {
        screen: 'ChatRoom',
        params: { chatId: data.data.id, otherUser: data.data.otherUser },
      });
    } catch { Alert.alert('Error', 'Could not open chat.'); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;
  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: profile.profilePhotoUrl || 'https://via.placeholder.com/80' }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.username}>@{profile.username}</Text>
              <Text style={styles.postCount}>{profile._count.posts} posts</Text>
            </View>

            {isOwn ? (
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Text style={styles.outlineBtnText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.outlineBtn}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Text style={styles.outlineBtnText}>Settings</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
                <Text style={styles.messageBtnText}>Message</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <Image source={{ uri: item.mediaUrl }} style={styles.gridItem} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  profileHeader: { padding: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.lightGray },
  info: { marginTop: 12 },
  name: { fontSize: 18, fontWeight: '700' },
  username: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  postCount: { fontSize: 14, marginTop: 6 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  outlineBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.lightGray,
    borderRadius: 8, paddingVertical: 8, alignItems: 'center',
  },
  outlineBtnText: { fontWeight: '600', fontSize: 14 },
  messageBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', marginTop: 16,
  },
  messageBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, backgroundColor: COLORS.lightGray },
});
