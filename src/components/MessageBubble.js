import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function MessageBubble({ message, isOwn, onPostPress }) {
  const bubbleStyle = isOwn ? styles.ownBubble : styles.otherBubble;
  const textStyle = isOwn ? styles.ownText : styles.otherText;
  const align = isOwn ? 'flex-end' : 'flex-start';

  return (
    <View style={[styles.container, { alignItems: align }]}>
      {message.messageType === 'shared_post' && message.post ? (
        <TouchableOpacity
          style={[bubbleStyle, styles.postBubble]}
          onPress={() => onPostPress?.(message.post.id)}
        >
          {!message.post.isDeleted ? (
            <>
              <Image
                source={{ uri: message.post.mediaUrl }}
                style={styles.postThumb}
              />
              <View style={styles.postInfo}>
                <Text style={[textStyle, { fontWeight: '600', fontSize: 12 }]}>
                  @{message.post.user?.username}
                </Text>
                {message.post.caption ? (
                  <Text style={[textStyle, { fontSize: 12 }]} numberOfLines={2}>
                    {message.post.caption}
                  </Text>
                ) : null}
              </View>
            </>
          ) : (
            <Text style={[textStyle, { fontStyle: 'italic' }]}>Post unavailable</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={bubbleStyle}>
          <Text style={textStyle}>{message.text}</Text>
        </View>
      )}
      <Text style={styles.time}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4, paddingHorizontal: 12 },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '75%',
  },
  otherBubble: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: '75%',
  },
  postBubble: { padding: 0, overflow: 'hidden', width: 220 },
  ownText: { color: COLORS.white, fontSize: 14 },
  otherText: { color: COLORS.black, fontSize: 14 },
  postThumb: { width: 220, height: 160, backgroundColor: COLORS.lightGray },
  postInfo: { padding: 8 },
  time: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
});
