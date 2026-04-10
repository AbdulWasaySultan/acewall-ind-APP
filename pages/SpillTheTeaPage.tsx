import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { Comment, Post } from '../components/spillTheTea';
import { COLORS, MOCK_POSTS } from '../components/spillTheTea/mnt/user-data/outputs/SpillTheTea/constants';
import { toggleLike } from '../components/spillTheTea/mnt/user-data/outputs/SpillTheTea/helpers';
import HeaderButton from '../components/spillTheTea/HeaderButton';
import PostCard from '../components/spillTheTea/PostCard';
import CommentsModal from '../components/spillTheTea/CommentsModal';
import CreatePostModal from '../components/spillTheTea/CreatePostModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// ── Types ──

// ─────────────────────────────────────────────────────────────────────────────
// SPILL THE TEA PAGE
// ─────────────────────────────────────────────────────────────────────────────

const SpillTheTeaPage: React.FC = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    // ── State ──
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    // TODO: replace with useAuth()
    const currentUserId = 'CURRENT_USER_ID';

    // ── Fetch posts ──
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            // Replace with real API call:
            // const { data } = await api.get('/spill-the-tea/posts');
            // setPosts(data.posts);
            setPosts(MOCK_POSTS);
        } catch {
            Alert.alert('Error', 'Failed to load posts.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // ── Toggle like (optimistic) ──
    const handleLike = (postId: string) => {
        setPosts((prev) =>
            prev.map((p) =>
                p._id === postId ? { ...p, likes: toggleLike(p.likes, currentUserId) } : p
            )
        );
        //  Replace with real API call:
        // api.post(`/spill-the-tea/posts/${postId}/like`);
    };

    // ── Add comment (optimistic) ──
    const handleAddComment = (postId: string, text: string) => {
        const newComment: Comment = {
            _id: Date.now().toString(),
            content: text,
            author: { _id: currentUserId, firstName: 'You', lastName: '' },
            createdAt: new Date().toISOString(),
        };

        const addCommentTo = (p: Post) => ({ ...p, comments: [...p.comments, newComment] });

        setPosts((prev) => prev.map((p) => p._id === postId ? addCommentTo(p) : p));
        setSelectedPost((prev) => prev?._id === postId ? addCommentTo(prev) : prev);

        //  Replace with real API call:
        // api.post(`/spill-the-tea/posts/${postId}/comments`, { content: text });
    };

    // ── Create post (optimistic) ──
    const handleCreatePost = (content: string) => {
        const newPost: Post = {
            _id: Date.now().toString(),
            content,
            author: { _id: currentUserId, firstName: 'You', lastName: '', role: 'student' },
            likes: [],
            comments: [],
            createdAt: new Date().toISOString(),
        };

        setPosts((prev) => [newPost, ...prev]);

        //  Replace with real API call:
        // api.post('/spill-the-tea/posts', { content });
    };

    // ── Open comments for a specific post ──
    const openComments = (post: Post) => {
        setSelectedPost(post);
        setCommentsOpen(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerIcon}>☕</Text>
                    <Text style={styles.headerTitle}>Spill The Tea</Text>
                </View>
                <View style={styles.headerActions}>
                    <HeaderButton
                        label="Profile"
                        icon="👤"
                        onPress={() => navigation.navigate('SpillTheTeaProfile')}
                    />
                    <HeaderButton
                        label="Create"
                        icon="⊕"
                        onPress={() => setCreateOpen(true)}
                    />
                </View>
            </View>

            {/* ── Feed ── */}
            {loading ? (
                <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(p) => p._id}
                    contentContainerStyle={styles.feed}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No posts yet. Spill the tea! ☕</Text>
                    }
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            currentUserId={currentUserId}
                            onLike={handleLike}
                            onCommentPress={openComments}
                        />
                    )}
                />
            )}

            {/* ── Comments Modal ── */}
            <CommentsModal
                visible={commentsOpen}
                post={selectedPost}
                onClose={() => setCommentsOpen(false)}
                onAddComment={handleAddComment}
            />

            {/* ── Create Post Modal ── */}
            <CreatePostModal
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={({ content, target, media }) => handleCreatePost(content)}
            />
        </SafeAreaView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerIcon: { fontSize: 20 },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
    headerActions: { flexDirection: 'row', gap: 10 },
    feed: { padding: 16, paddingTop: 20 },
    loader: { marginTop: 80 },
    emptyText: { textAlign: 'center', color: COLORS.textMid, fontSize: 15, marginTop: 80 },
});

export default SpillTheTeaPage;