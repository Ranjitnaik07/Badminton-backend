import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  Alert, ActivityIndicator, SafeAreaView, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import usePostStore from '../store/postStore';
import api from '../services/api';
import { COLORS } from '../utils/constants';

export default function CreatePostScreen({ navigation }) {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const addPost = usePostStore((s) => s.addPost);

  const pickMedia = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert('Permission denied');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) setMedia(result.assets[0]);
  };

  const handlePost = async () => {
    if (!media) return Alert.alert('Error', 'Please select a photo or video.');
    setLoading(true);
    try {
      const isVideo = media.type === 'video';
      const formData = new FormData();
      formData.append('media', {
        uri: media.uri,
        type: isVideo ? 'video/mp4' : 'image/jpeg',
        name: isVideo ? 'post.mp4' : 'post.jpg',
      });
      if (caption.trim()) formData.append('caption', caption.trim());

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addPost(data.data);
      setMedia(null);
      setCaption('');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading || !media}
          style={[styles.shareBtn, (!media || loading) && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.shareBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView>
        <TouchableOpacity style={styles.picker} onPress={pickMedia}>
          {media ? (
            <Image source={{ uri: media.uri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>Tap to select photo or video</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
          placeholder="Write a caption..."
          multiline
          maxLength={2200}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderColor: COLORS.lightGray,
  },
  title: { fontSize: 18, fontWeight: '700' },
  shareBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  shareBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.4 },
  picker: { width: '100%', aspectRatio: 1 },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  placeholderIcon: { fontSize: 48, marginBottom: 8 },
  placeholderText: { color: COLORS.gray, fontSize: 15 },
  captionInput: { padding: 16, fontSize: 15, minHeight: 80 },
});
