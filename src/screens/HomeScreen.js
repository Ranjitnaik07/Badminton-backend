import React, { useEffect, useCallback } from 'react';
import {
  FlatList, View, StyleSheet, ActivityIndicator, RefreshControl,
  SafeAreaView, TextInput, TouchableOpacity, Text,
} from 'react-native';
import PostCard from '../components/PostCard';
import usePostStore from '../store/postStore';
import { COLORS } from '../utils/constants';

export default function HomeScreen({ navigation }) {
  const { posts, isLoading, hasMore, fetchFeed, toggleLike } = usePostStore();

  useEffect(() => { fetchFeed(true); }, []);

  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMore) fetchFeed(false);
  }, [isLoading, hasMore]);

  const renderItem = ({ item }) => (
    <PostCard
      post={item}
      onLike={toggleLike}
      onComment={(post) => navigation.navigate('PostDetail', { postId: post.id })}
      onShare={(post) => navigation.navigate('SharePost', { postId: post.id })}
      onUserPress={(username) => navigation.navigate('UserProfile', { username })}
    />
  );

  const renderFooter = () =>
    isLoading ? <ActivityIndicator style={{ margin: 20 }} color={COLORS.primary} /> : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SocialStream</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && posts.length === 0}
            onRefresh={() => fetchFeed(true)}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderColor: COLORS.lightGray, backgroundColor: COLORS.white,
  },
  logo: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  searchIcon: { fontSize: 22 },
});
