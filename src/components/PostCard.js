import React, { useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { COLORS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function PostCard({ post, onLike, onComment, onShare, onUserPress, showActions = true }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const handleVideoPress = () => setMuted((m) => !m);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => onUserPress?.(post.user.username)}>
        <Image
          source={{ uri: post.user.profilePhotoUrl || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>@{post.user.username}</Text>
      </TouchableOpacity>

      {post.mediaType === 'video' ? (
        <TouchableOpacity activeOpacity={1} onPress={handleVideoPress}>
          <Video
            ref={videoRef}
            source={{ uri: post.mediaUrl }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay
            isLooping
            isMuted={muted}
          />
          {muted && (
            <View style={styles.muteOverlay}>
              <Text style={styles.muteIcon}>🔇</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="cover" />
      )}

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onLike?.(post.id)}>
            <Text style={[styles.actionIcon, post.isLiked && styles.likedIcon]}>
              {post.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.count}>{post._count.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(post)}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.count}>{post._count.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onShare?.(post)}>
            <Text style={styles.actionIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      )}

      {post.caption ? (
        <View style={styles.captionRow}>
          <Text style={styles.captionUsername}>@{post.user.username}</Text>
          <Text style={styles.caption}> {post.caption}</Text>
        </View>
      ) : null}

      <Text style={styles.timestamp}>
        {new Date(post.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.white, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: COLORS.lightGray },
  username: { fontWeight: '600', fontSize: 14 },
  media: { width, height: width, backgroundColor: COLORS.lightGray },
  muteOverlay: { position: 'absolute', bottom: 10, right: 10 },
  muteIcon: { fontSize: 20 },
  actions: { flexDirection: 'row', padding: 10, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 22 },
  likedIcon: { fontSize: 22 },
  count: { fontSize: 13, color: COLORS.black },
  captionRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 4 },
  captionUsername: { fontWeight: '700', fontSize: 13 },
  caption: { fontSize: 13, flex: 1 },
  timestamp: { fontSize: 11, color: COLORS.gray, paddingHorizontal: 12, paddingBottom: 12 },
});
