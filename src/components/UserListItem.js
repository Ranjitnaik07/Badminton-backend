import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function UserListItem({ user, onPress, rightElement }) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(user)}>
      <Image
        source={{ uri: user.profilePhotoUrl || 'https://via.placeholder.com/44' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.lightGray },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '600', fontSize: 14 },
  username: { fontSize: 13, color: COLORS.gray, marginTop: 1 },
});
