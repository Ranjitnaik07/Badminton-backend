import React, { useState, useCallback } from 'react';
import {
  View, TextInput, FlatList, StyleSheet, Text, SafeAreaView, ActivityIndicator,
} from 'react-native';
import UserListItem from '../components/UserListItem';
import api from '../services/api';
import { COLORS } from '../utils/constants';

let debounceTimer;

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback((q) => {
    clearTimeout(debounceTimer);
    if (q.length < 2) { setResults([]); setSearched(false); return; }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/search', { params: { q } });
        setResults(data.data);
        setSearched(true);
      } catch {}
      finally { setLoading(false); }
    }, 300);
  }, []);

  const handleChange = (text) => {
    setQuery(text);
    search(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChange}
          placeholder="Search users..."
          autoCapitalize="none"
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={COLORS.gray} />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            onPress={(u) => navigation.navigate('Home', {
              screen: 'UserProfile',
              params: { username: u.username },
            })}
          />
        )}
        ListEmptyComponent={
          searched && !loading ? (
            <Text style={styles.empty}>No users found for "{query}"</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: COLORS.background, borderRadius: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15 },
  empty: { textAlign: 'center', color: COLORS.gray, marginTop: 40, fontSize: 15 },
});
