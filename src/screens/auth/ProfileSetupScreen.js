import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Image, ScrollView, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { COLORS } from '../../utils/constants';

export default function ProfileSetupScreen() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Permission denied');
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
    if (value.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    try {
      const { data } = await api.get('/users/me/check-username', { params: { username: value } });
      setUsernameAvailable(data.data.available);
    } catch { setUsernameAvailable(null); }
    finally { setCheckingUsername(false); }
  };

  const validateDob = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return false;
    const age = (new Date() - date) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 13;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    if (!username || username.length < 3) return Alert.alert('Error', 'Username must be at least 3 characters.');
    if (usernameAvailable === false) return Alert.alert('Error', 'Username is taken.');
    if (!validateDob(dob)) return Alert.alert('Error', 'You must be at least 13 years old.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('username', username.trim().toLowerCase());
      formData.append('dob', dob);
      if (photo) {
        formData.append('photo', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      const { data } = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Set up your profile</Text>

        <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
          <Image
            source={{ uri: photo?.uri || user?.profilePhotoUrl || 'https://via.placeholder.com/100' }}
            style={styles.photoPreview}
          />
          <Text style={styles.photoText}>Change photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flex]}
            value={username}
            onChangeText={checkUsername}
            placeholder="username"
            autoCapitalize="none"
          />
          {checkingUsername && <ActivityIndicator style={styles.checkIcon} size="small" />}
          {!checkingUsername && usernameAvailable === true && (
            <Text style={[styles.checkIcon, { color: COLORS.success }]}>✓</Text>
          )}
          {!checkingUsername && usernameAvailable === false && (
            <Text style={[styles.checkIcon, { color: COLORS.danger }]}>✗</Text>
          )}
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Must be 13+ years old. Not publicly shown.</Text>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.disabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>Get Started</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24 },
  photoPicker: { alignItems: 'center', marginBottom: 24 },
  photoPreview: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.lightGray },
  photoText: { color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.lightGray,
    borderRadius: 10, padding: 12, fontSize: 15,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  checkIcon: { marginLeft: 10, fontSize: 18 },
  hint: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 32,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
