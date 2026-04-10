import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNavigation } from '@react-navigation/native';           
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import { RootStackParamList } from '../navigation/AppNavigator';    

import ProfileHeader     from '../components/spillTheTea/ProfileHeader';
import ProfilePostCard   from '../components/spillTheTea/Profilepostcard';
import { Author, Post } from '../components/spillTheTea';
import { toggleLike } from '../components/spillTheTea/mnt/user-data/outputs/SpillTheTea/helpers';

// ── Typed icon wrapper ──
const Icon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <MaterialIcons name={name as any} size={size} color={color} />
);

// ─────────────────────────────────────────────────────────────────────────────
// MOCK — replace with real API + useAuth()
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CURRENT_USER: Author & { email: string } = {
  _id:        'u1',
  firstName:  'acewallscholars',
  lastName:   'Student',
  role:       'student',
  email:      'acewallglobalindustries@gmail.com',
  profileImg: undefined,
};

const MOCK_MY_POSTS: Post[] = [
  {
    _id:       '1',
    content:   'Hi, this is amazing post',
    author:    MOCK_CURRENT_USER,
    likes:     ['u2'],
    comments:  [],
    createdAt: new Date('2026-04-10T22:59:49').toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const SpillTheTeaProfilePage: React.FC = () => {                    //no Props needed

  //useNavigation hook — works regardless of how screen is registered
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ── State ──
  const [user,    setUser]    = useState<Author & { email?: string } | null>(null);
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: replace with useAuth()
  const currentUserId = 'u1';

  // ── Fetch user profile & their posts ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      //Replace with real API:
      // const { data } = await api.get('/spill-the-tea/my-posts');
      // setUser(data.user);
      // setPosts(data.posts);
      setUser(MOCK_CURRENT_USER);
      setPosts(MOCK_MY_POSTS);
    } catch {
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Delete post ──
  const handleDelete = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    //Replace with real API:
    // await api.delete(`/spill-the-tea/posts/${postId}`);
  };

  // ── Like / unlike post ──
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: toggleLike(p.likes, currentUserId) } : p
      )
    );
    //Replace with real API:
    // api.post(`/spill-the-tea/posts/${postId}/like`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Back button ── */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}   //now works
      >
        <Icon name="arrow-back" size={18} color="#fff" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1565C0" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p._id}
          contentContainerStyle={styles.feed}
          ListHeaderComponent={
            user ?
            <View style={{ marginBottom: 20 }}>
            <ProfileHeader user={user} postCount={posts.length} />
            </View> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No posts yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProfilePostCard
              post={item}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          )}
        />
      )}

    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white', paddingTop:40 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', backgroundColor: '#10B144',
    margin: 20, padding:15,
    borderRadius: 100,
  },
  backText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  loader:    { marginTop: 80 },
  feed:      { paddingHorizontal: 16, paddingBottom: 30, },
  emptyBox:  { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: '#888' },
});

export default SpillTheTeaProfilePage;