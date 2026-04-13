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



// ── API ──────────────────────────────────────────────────────────────────────
import {
    fetchAllPosts,
    likePost,
    addComment,
    createSocialPost,
} from '../services/socialPosts';

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — normalize post from API (ensures likes/comments always arrays)
// ─────────────────────────────────────────────────────────────────────────────
const normalizePost = (p: any): Post => ({
    ...p,
    likes: p.likes ?? [],
    comments: p.comments ?? [],
});

// ─────────────────────────────────────────────────────────────────────────────
// SPILL THE TEA PAGE
// ─────────────────────────────────────────────────────────────────────────────

const SpillTheTeaPage: React.FC = () => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // ── State ─────────────────────────────────────────────────────────────────
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    // TODO: replace with useAuth()
    const currentUserId = 'CURRENT_USER_ID';

    // ─────────────────────────────────────────────────────────────────────────
    // API — Fetch posts (initial load + pull-to-refresh)
    // Response: { currentPage, totalPages, totalPosts, limit, posts: [] }
    // ─────────────────────────────────────────────────────────────────────────
    const fetchPosts = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await fetchAllPosts(1, 10);
            setPosts((data.posts ?? []).map(normalizePost));
            setPage(1);
            setTotalPages(data.totalPages ?? 1);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load posts.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // ─────────────────────────────────────────────────────────────────────────
    // API — Load more posts (pagination on scroll)
    // ─────────────────────────────────────────────────────────────────────────
    const loadMorePosts = async () => {
        if (loadingMore || page >= totalPages) return; // no more pages

        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const data = await fetchAllPosts(nextPage, 10);
            setPosts((prev) => [
                ...prev,
                ...(data.posts ?? []).map(normalizePost),
            ]);
            setPage(nextPage);
            setTotalPages(data.totalPages ?? 1);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load more posts.');
        } finally {
            setLoadingMore(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // API — Like / Unlike (optimistic update + auto-revert on failure)
    // ─────────────────────────────────────────────────────────────────────────
    const handleLike = async (postId: string) => {
        // Step 1: Update UI immediately
        setPosts((prev) =>
            prev.map((p) =>
                p._id === postId
                    ? { ...p, likes: toggleLike(p.likes ?? [], currentUserId) }
                    : p
            )
        );
        try {
            // Step 2: Call API → /api/postlike/like/:postId
            await likePost(postId);
        } catch (error: any) {
            // Step 3: Revert on failure
            setPosts((prev) =>
                prev.map((p) =>
                    p._id === postId
                        ? { ...p, likes: toggleLike(p.likes ?? [], currentUserId) }
                        : p
                )
            );
            Alert.alert('Error', error.message || 'Failed to update like.');
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // API — Add Comment (optimistic update)
    // ─────────────────────────────────────────────────────────────────────────
    const handleAddComment = async (postId: string, text: string) => {
        const newComment: Comment = {
            _id: Date.now().toString(),
            content: text,
            author: { _id: currentUserId, firstName: 'You', lastName: '' },
            createdAt: new Date().toISOString(),
        };

        const addCommentTo = (p: Post): Post => ({
            ...p,
            comments: [...(p.comments ?? []), newComment],
        });

        // Step 1: Update feed + modal immediately
        setPosts((prev) => prev.map((p) => p._id === postId ? addCommentTo(p) : p));
        setSelectedPost((prev) => prev?._id === postId ? addCommentTo(prev) : prev);

        try {
            // Step 2: Call API → /api/postComment/sendComment/:postId
            await addComment(postId, text);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send comment.');
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // API — Create Post (optimistic update with temp post)
    // ─────────────────────────────────────────────────────────────────────────
    const handleCreatePost = async (text: string, image?: any) => {
        const tempId = `temp_${Date.now()}`;
        const tempPost: Post = {
            _id: tempId,
            text,                // ← was content
            assets: [],
            postType: 'public',
            author: { _id: currentUserId, firstName: 'You', lastName: '', role: 'student' },
            likes: [],
            comments: [],
            createdAt: new Date().toISOString(),
        };
        setPosts((prev) => [tempPost, ...prev]);

        try {
            const response = await createSocialPost(text, image); // ← pass text
            const created = normalizePost(response.post ?? response);
            setPosts((prev) => prev.map((p) => p._id === tempId ? created : p));
        } catch (error: any) {
            setPosts((prev) => prev.filter((p) => p._id !== tempId));
            Alert.alert('Error', error.message || 'Failed to create post.');
        }
    };

    // ── Open comments for a post ──────────────────────────────────────────────
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
                <ActivityIndicator
                    style={styles.loader}
                    size="large"
                    color={COLORS.primary}
                />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(p) => p._id}
                    contentContainerStyle={styles.feed}

                    // Pull-to-refresh
                    refreshing={refreshing}
                    onRefresh={() => fetchPosts(true)}

                    // Infinite scroll pagination
                    onEndReached={loadMorePosts}
                    onEndReachedThreshold={0.3}

                    // Spinner at bottom while loading more
                    ListFooterComponent={
                        loadingMore
                            ? <ActivityIndicator
                                style={styles.loadMoreSpinner}
                                color={COLORS.primary}
                            />
                            : null
                    }

                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No posts yet. Spill the tea! ☕
                        </Text>
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

            {/* ── Comments Bottom Sheet ── */}
            <CommentsModal
                visible={commentsOpen}
                post={selectedPost}
                onClose={() => setCommentsOpen(false)}
                onAddComment={handleAddComment}
            />

            {/* ── Create Post Bottom Sheet ── */}
            <CreatePostModal
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={({ content, media }) =>
                    handleCreatePost(content, media?.[0] ?? null)
                }
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerIcon: { fontSize: 20 },
    headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
    headerActions: { flexDirection: 'row', gap: 10 },
    feed: { padding: 16, paddingTop: 20 },
    loader: { marginTop: 80 },
    loadMoreSpinner: { marginVertical: 16 },
    emptyText: { textAlign: 'center', color: COLORS.textMid, fontSize: 15, marginTop: 80 },
});

export default SpillTheTeaPage;