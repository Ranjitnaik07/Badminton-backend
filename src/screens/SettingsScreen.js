import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import useAuthStore from '../store/authStore';
import usePostStore from '../store/postStore';
import useChatStore from '../store/chatStore';
import { COLORS } from '../utils/constants';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const resetPosts = usePostStore((s) => s.reset);
  const resetChats = useChatStore((s) => s.reset);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          resetPosts();
          resetChats();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>@{user?.username}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.label}>Terms of Service</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: {
    backgroundColor: COLORS.white, borderRadius: 12,
    margin: 16, overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: COLORS.gray,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 0.5, borderColor: COLORS.lightGray,
  },
  label: { fontSize: 15 },
  value: { fontSize: 15, color: COLORS.gray },
  arrow: { fontSize: 18, color: COLORS.gray },
  logoutBtn: {
    margin: 16, backgroundColor: COLORS.white, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  logoutText: { color: COLORS.danger, fontSize: 16, fontWeight: '600' },
});
