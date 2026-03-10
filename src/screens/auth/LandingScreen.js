import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

WebBrowser.maybeCompleteAuthSession();

export default function LandingScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication.idToken);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken) => {
    if (!idToken) return;
    setLoading(true);
    try {
      const result = await loginWithGoogle(idToken);
      if (!result.user.isProfileComplete) {
        navigation.replace('ProfileSetup');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>SocialStream</Text>
        <Text style={styles.tagline}>Share your world.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.googleBtn, (!request || loading) && styles.disabled]}
          onPress={() => promptAsync()}
          disabled={!request || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.black} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.terms}>
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 42, fontWeight: '800', color: COLORS.primary, letterSpacing: -1 },
  tagline: { fontSize: 16, color: COLORS.gray, marginTop: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: { opacity: 0.5 },
  googleIcon: { fontSize: 20, fontWeight: '700', color: '#4285F4' },
  googleText: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  terms: { textAlign: 'center', fontSize: 12, color: COLORS.gray, marginTop: 16 },
});
