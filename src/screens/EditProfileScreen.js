import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Image, ScrollView, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [photo, setPhoto] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const checkUsername = async (value) => {
    setUsername(value);
    if (value === user.username) { setUsernameAvailable(null); return; }
    if (value.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    try {
      const { data } = await api.get('/users/me/check-username', { params: { username: value } });
      setUsernameAvailable(data.data.available);
    } finally { setCheckingUsername(false); }
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    if (username !== user.username && usernameAvailable === false) {
      return Alert.alert('Error', 'Username is taken.');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('username', username.trim().toLowerCase());
      if (photo) {
        formData.append('photo', { uri: photo.uri, type: 'image/jpeg', name: 'profile.jpg' });
      }
      const { data } = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
          <Image
            source={{ uri: photo?.uri || user?.profilePhotoUrl || 'https://via.placeholder.com/100' }}
            style={styles.photo}
          />
          <Text style={styles.photoText}>Change photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} autoCapitalize="words" />

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flex]}
            value={username}
            onChangeText={checkUsername}
            autoCapitalize="none"
          />
          {checkingUsername && <ActivityIndicator style={{ marginLeft: 8 }} size="small" />}
          {!checkingUsername && usernameAvailable === true && (
            <Text style={[styles.status, { color: COLORS.success }]}>✓</Text>
          )}
          {!checkingUsername && usernameAvailable === false && (
            <Text style={[styles.status, { color: COLORS.danger }]}>✗</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 24 },
  photoPicker: { alignItems: 'center', marginBottom: 24 },
  photo: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.lightGray },
  photoText: { color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1.5, borderColor: COLORS.lightGray, borderRadius: 10, padding: 12, fontSize: 15 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  status: { marginLeft: 10, fontSize: 18 },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 32,
  },
  disabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
